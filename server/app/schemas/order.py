from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import OrderStatus
from app.schemas.common import ORMBase


class OrderCreate(BaseModel):
    provider_id: int
    title: str = Field(min_length=3, max_length=255)
    description: str = ""
    address: str = ""
    commission: float = Field(default=0.0, ge=0)


class OrderUpdateByProvider(BaseModel):
    status: OrderStatus
    provider_response: str = ""


class OrderOut(ORMBase):
    id: int
    user_id: int
    provider_id: int
    title: str
    description: str
    address: str
    status: OrderStatus
    commission: float
    provider_response: str
    created_at: datetime
