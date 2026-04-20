from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.deps import get_current_user
from app.models.enums import OrderStatus, UserRole
from app.models.order import Order
from app.models.provider_profile import ProviderProfile
from app.models.review import Review
from app.models.user import User
from app.schemas.order import OrderOut
from app.schemas.review import ReviewCreate, ReviewOut
from app.services.rating_service import recalculate_provider_rating

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("/provider/{provider_id}", response_model=list[ReviewOut])
def list_provider_reviews(provider_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .filter(Review.provider_id == provider_id)
        .order_by(Review.created_at.desc())
        .all()
    )


@router.get("/eligible-orders/{provider_id}", response_model=list[OrderOut])
def eligible_orders(provider_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.USER:
        raise HTTPException(status_code=403, detail="Faqat foydalanuvchi uchun")

    reviewed_order_ids = db.query(Review.order_id).filter(Review.user_id == current_user.id).subquery()

    return (
        db.query(Order)
        .filter(
            Order.user_id == current_user.id,
            Order.provider_id == provider_id,
            Order.status == OrderStatus.COMPLETED,
            ~Order.id.in_(reviewed_order_ids),
        )
        .order_by(Order.created_at.desc())
        .all()
    )


@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(payload: ReviewCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.USER:
        raise HTTPException(status_code=403, detail="Faqat foydalanuvchi uchun")

    provider = db.query(ProviderProfile).filter(ProviderProfile.id == payload.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Usta topilmadi")

    order = (
        db.query(Order)
        .filter(
            Order.id == payload.order_id,
            Order.user_id == current_user.id,
            Order.provider_id == payload.provider_id,
            Order.status == OrderStatus.COMPLETED,
        )
        .first()
    )
    if not order:
        raise HTTPException(status_code=400, detail="Faqat yakunlangan buyurtmaga sharh yozish mumkin")

    existing = db.query(Review).filter(Review.order_id == payload.order_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu buyurtmaga sharh allaqachon yozilgan")

    review = Review(user_id=current_user.id, **payload.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)

    avg, total = recalculate_provider_rating(db, payload.provider_id)
    provider.average_rating = avg
    provider.total_reviews = total
    db.commit()

    return review
