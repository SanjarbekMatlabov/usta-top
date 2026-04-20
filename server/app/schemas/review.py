from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class ReviewCreate(BaseModel):
    provider_id: int
    order_id: int
    rating: int = Field(ge=1, le=5)
    comment: str = ""


class ReviewOut(ORMBase):
    id: int
    user_id: int
    provider_id: int
    order_id: int
    rating: int
    comment: str
    created_at: datetime
