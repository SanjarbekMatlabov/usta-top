from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.review import Review


def recalculate_provider_rating(db: Session, provider_id: int) -> tuple[float, int]:
    result = db.query(func.avg(Review.rating), func.count(Review.id)).filter(Review.provider_id == provider_id).one()
    average = float(result[0] or 0.0)
    total = int(result[1] or 0)
    return average, total
