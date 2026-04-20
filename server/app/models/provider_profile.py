from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class ProviderProfile(Base):
    __tablename__ = "provider_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(String(120), nullable=False)
    skills: Mapped[str] = mapped_column(Text, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    pricing: Mapped[str] = mapped_column(String(120), default="")
    location: Mapped[str] = mapped_column(String(120), default="")
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    premium: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    average_rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_reviews: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="provider_profile")
    orders = relationship("Order", back_populates="provider")
    reviews = relationship("Review", back_populates="provider")
