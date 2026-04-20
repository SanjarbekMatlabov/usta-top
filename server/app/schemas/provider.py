from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class ProviderProfileCreate(BaseModel):
    category: str = Field(min_length=2, max_length=120)
    skills: str = ""
    description: str = ""
    pricing: str = ""
    location: str = ""


class ProviderProfileUpdate(BaseModel):
    category: str | None = Field(default=None, min_length=2, max_length=120)
    skills: str | None = None
    description: str | None = None
    pricing: str | None = None
    location: str | None = None


class ProviderProfileOut(ORMBase):
    id: int
    user_id: int
    category: str
    skills: str
    description: str
    pricing: str
    location: str
    verified: bool
    premium: bool
    average_rating: float
    total_reviews: int


class ProviderDetailOut(ProviderProfileOut):
    full_name: str
