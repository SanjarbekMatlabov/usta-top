from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
import time

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.database import Base, SessionLocal, engine
from app.models.user import User
from app.routers import auth, orders, providers, reviews, users
from app.models.enums import UserRole
from app.services.seed_service import seed_demo_content


def init_db_with_retry(max_attempts: int = 10, delay_seconds: int = 3) -> None:
    for attempt in range(1, max_attempts + 1):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError:
            if attempt == max_attempts:
                raise
            time.sleep(delay_seconds)


init_db_with_retry()


def seed_default_admin() -> None:
    db = SessionLocal()
    try:
        admin_email = "admin@gmail.com"
        admin = db.query(User).filter(User.email == admin_email).first()

        if not admin:
            admin = User(
                full_name="Super Admin",
                email=admin_email,
                password_hash=get_password_hash("admin"),
                role=UserRole.ADMIN,
            )
            db.add(admin)
        else:
            admin.role = UserRole.ADMIN
            admin.password_hash = get_password_hash("admin")

        db.commit()
    finally:
        db.close()


def seed_demo_data() -> None:
    db = SessionLocal()
    try:
        seed_demo_content(db)
    finally:
        db.close()

app = FastAPI(title=settings.app_name)


@app.on_event("startup")
def startup_seed_data() -> None:
    seed_default_admin()
    seed_demo_data()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(providers.router, prefix=settings.api_prefix)
app.include_router(orders.router, prefix=settings.api_prefix)
app.include_router(reviews.router, prefix=settings.api_prefix)


@app.get("/")
def health_check():
    return {"message": "UstaTop.uz API ishlayapti"}
