from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.deps import get_current_user
from app.models.enums import UserRole
from app.models.provider_profile import ProviderProfile
from app.models.user import User
from app.schemas.provider import ProviderDetailOut, ProviderProfileCreate, ProviderProfileOut, ProviderProfileUpdate

router = APIRouter(prefix="/providers", tags=["Providers"])


@router.get("", response_model=list[ProviderDetailOut])
def list_providers(
    db: Session = Depends(get_db),
    category: str | None = Query(default=None),
    search: str | None = Query(default=None),
):
    query = db.query(ProviderProfile, User.full_name).join(User, ProviderProfile.user_id == User.id)

    if category:
        query = query.filter(ProviderProfile.category.ilike(f"%{category}%"))
    if search:
        query = query.filter(User.full_name.ilike(f"%{search}%"))

    rows = query.order_by(ProviderProfile.premium.desc(), ProviderProfile.average_rating.desc()).all()
    return [
        ProviderDetailOut(
            id=row[0].id,
            user_id=row[0].user_id,
            category=row[0].category,
            skills=row[0].skills,
            description=row[0].description,
            pricing=row[0].pricing,
            location=row[0].location,
            verified=row[0].verified,
            premium=row[0].premium,
            average_rating=row[0].average_rating,
            total_reviews=row[0].total_reviews,
            full_name=row[1],
        )
        for row in rows
    ]


@router.get("/{provider_id}", response_model=ProviderDetailOut)
def provider_detail(provider_id: int, db: Session = Depends(get_db)):
    row = (
        db.query(ProviderProfile, User.full_name)
        .join(User, ProviderProfile.user_id == User.id)
        .filter(ProviderProfile.id == provider_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Usta topilmadi")

    profile, full_name = row
    return ProviderDetailOut(
        id=profile.id,
        user_id=profile.user_id,
        category=profile.category,
        skills=profile.skills,
        description=profile.description,
        pricing=profile.pricing,
        location=profile.location,
        verified=profile.verified,
        premium=profile.premium,
        average_rating=profile.average_rating,
        total_reviews=profile.total_reviews,
        full_name=full_name,
    )


@router.get("/me/profile", response_model=ProviderProfileOut)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.PROVIDER:
        raise HTTPException(status_code=403, detail="Faqat ustalar uchun")

    profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil topilmadi")
    return profile


@router.post("/me/profile", response_model=ProviderProfileOut, status_code=status.HTTP_201_CREATED)
def create_my_profile(
    payload: ProviderProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.PROVIDER:
        raise HTTPException(status_code=403, detail="Faqat ustalar uchun")

    existing = db.query(ProviderProfile).filter(ProviderProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profil allaqachon yaratilgan")

    profile = ProviderProfile(user_id=current_user.id, **payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/me/profile", response_model=ProviderProfileOut)
def update_my_profile(
    payload: ProviderProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.PROVIDER:
        raise HTTPException(status_code=403, detail="Faqat ustalar uchun")

    profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil topilmadi")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.patch("/me/premium", response_model=ProviderProfileOut)
def upgrade_to_premium(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.PROVIDER:
        raise HTTPException(status_code=403, detail="Faqat ustalar uchun")

    profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil topilmadi")

    profile.premium = True
    db.commit()
    db.refresh(profile)
    return profile


@router.patch("/{provider_id}/verify", response_model=ProviderProfileOut)
def verify_provider(
    provider_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Faqat admin tasdiqlaydi")

    profile = db.query(ProviderProfile).filter(ProviderProfile.id == provider_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Usta topilmadi")

    profile.verified = True
    db.commit()
    db.refresh(profile)
    return profile
