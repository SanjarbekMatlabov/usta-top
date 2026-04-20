from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.deps import get_current_user
from app.models.enums import OrderStatus, UserRole
from app.models.order import Order
from app.models.provider_profile import ProviderProfile
from app.models.user import User
from app.schemas.order import OrderCreate, OrderOut, OrderUpdateByProvider

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.USER:
        raise HTTPException(status_code=403, detail="Buyurtma faqat oddiy foydalanuvchi yaratadi")

    provider = db.query(ProviderProfile).filter(ProviderProfile.id == payload.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Usta topilmadi")

    order = Order(user_id=current_user.id, **payload.model_dump())
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/my", response_model=list[OrderOut])
def my_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.USER:
        raise HTTPException(status_code=403, detail="Faqat foydalanuvchi uchun")

    return (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("/provider/incoming", response_model=list[OrderOut])
def incoming_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.PROVIDER:
        raise HTTPException(status_code=403, detail="Faqat ustalar uchun")

    profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil topilmadi")

    return (
        db.query(Order)
        .filter(Order.provider_id == profile.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.patch("/{order_id}/provider", response_model=OrderOut)
def provider_update_order(
    order_id: int,
    payload: OrderUpdateByProvider,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.PROVIDER:
        raise HTTPException(status_code=403, detail="Faqat ustalar uchun")

    profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil topilmadi")

    order = db.query(Order).filter(Order.id == order_id, Order.provider_id == profile.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")

    if payload.status not in (OrderStatus.PENDING, OrderStatus.COMPLETED):
        raise HTTPException(status_code=400, detail="Noto'g'ri status")

    order.status = payload.status
    order.provider_response = payload.provider_response
    db.commit()
    db.refresh(order)
    return order
