from __future__ import annotations

import random
from typing import Iterable

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.enums import OrderStatus, UserRole
from app.models.order import Order
from app.models.provider_profile import ProviderProfile
from app.models.review import Review
from app.models.user import User
from app.services.rating_service import recalculate_provider_rating

DEMO_PROVIDER_COUNT = 30
DEMO_CUSTOMER_COUNT = 12

PROVIDER_CATEGORIES = [
    "Elektrik",
    "Santexnik",
    "Konditsioner ustasi",
    "Maishiy texnika ustasi",
    "Mebel ustasi",
    "Eshik-deraza ustasi",
    "Bo'yoqchi",
    "Kafel ustasi",
    "Payvandchi",
    "Tom ustasi",
    "Gipsokarton ustasi",
    "Pol ustasi",
    "Signalizatsiya/Kamera ustasi",
    "Internet/Kabel ustasi",
    "Tozalash xizmati",
]

LOCATIONS = [
    "Toshkent",
    "Samarqand",
    "Buxoro",
    "Andijon",
    "Namangan",
    "Farg'ona",
    "Navoiy",
    "Qarshi",
    "Jizzax",
    "Urganch",
]

FIRST_NAMES = [
    "Aziz",
    "Bekzod",
    "Jasur",
    "Sherzod",
    "Dilshod",
    "Sanjar",
    "Umid",
    "Rustam",
    "Islom",
    "Murod",
    "Javohir",
    "Sardor",
    "Anvar",
    "Otabek",
]

LAST_NAMES = [
    "Karimov",
    "Yoqubov",
    "Toshmatov",
    "Qodirov",
    "Rashidov",
    "To'xtayev",
    "Hamidov",
    "Saidov",
    "Mirzayev",
    "Nurmuhammadov",
]

SKILL_MAP = {
    "Elektrik": "Uy elektr tarmoqlari, avtomat, rozetka, yoritish tizimlari, qisqa tutashuv diagnostikasi",
    "Santexnik": "Suv quvurlari, kanalizatsiya, kran, radiator, sanitariya uzellari",
    "Konditsioner ustasi": "Konditsioner montaji, servis, freon, diagnostika, ta'mirlash",
    "Maishiy texnika ustasi": "Kir yuvish mashinasi, muzlatgich, mikroto'lqinli pech, pech ta'miri",
    "Mebel ustasi": "Mebel yig'ish, demontaj, shkaf, stol, divan sozlash",
    "Eshik-deraza ustasi": "Metall va plastik eshik, deraza, qulflar, furnitura",
    "Bo'yoqchi": "Ichki va tashqi bo'yoq, silliqlash, dekorativ qoplama",
    "Kafel ustasi": "Kafel terish, grout, tekislash, vannaxona va oshxona ishlari",
    "Payvandchi": "Metall konstruksiya, payvandlash, darvoza, karkas, mustahkamlash",
    "Tom ustasi": "Tom yopish, ta'mirlash, gidroizolyatsiya, oqish bartaraf etish",
    "Gipsokarton ustasi": "Gipsokarton devor, shift, dekorativ nisha va bo'limlar",
    "Pol ustasi": "Laminat, parket, linoleum, pol tekislash va montaj",
    "Signalizatsiya/Kamera ustasi": "CCTV, signalizatsiya, domofon, smart xavfsizlik",
    "Internet/Kabel ustasi": "Wi-Fi, router sozlash, kabel tortish, internet diagnostikasi",
    "Tozalash xizmati": "Uy, ofis, umumiy tozalash, deraza yuvish, chiqindi olib chiqish",
}

PRICE_MAP = {
    "Elektrik": "150 000 so'mdan",
    "Santexnik": "120 000 so'mdan",
    "Konditsioner ustasi": "180 000 so'mdan",
    "Maishiy texnika ustasi": "140 000 so'mdan",
    "Mebel ustasi": "200 000 so'mdan",
    "Eshik-deraza ustasi": "160 000 so'mdan",
    "Bo'yoqchi": "130 000 so'mdan",
    "Kafel ustasi": "170 000 so'mdan",
    "Payvandchi": "220 000 so'mdan",
    "Tom ustasi": "250 000 so'mdan",
    "Gipsokarton ustasi": "190 000 so'mdan",
    "Pol ustasi": "160 000 so'mdan",
    "Signalizatsiya/Kamera ustasi": "230 000 so'mdan",
    "Internet/Kabel ustasi": "110 000 so'mdan",
    "Tozalash xizmati": "90 000 so'mdan",
}

REVIEW_COMMENTS = [
    "Juda tez keldi va ishni sifatli bajardi.",
    "Muammoni darhol topdi va aniq tushuntirdi.",
    "Professional, tartibli va toza ishladi.",
    "Narxi adolatli, natija zo'r bo'ldi.",
    "Kelishilgan vaqtda yetib keldi, tavsiya qilaman.",
    "Ishdan mamnun bo'ldim, juda puxta usta.",
    "Uyimizdagi muammo 1 soatda hal bo'ldi.",
]

ORDER_TITLES = [
    "Uy xizmatini bajarish",
    "Tezkor ta'mirlash",
    "Diagnostika va servis",
    "O'rnatish va sozlash",
    "Profilaktik tekshiruv",
]

CUSTOMER_PASSWORD = "customer123"
PROVIDER_PASSWORD = "provider123"
random.seed(42)


def _full_name(seed: int) -> str:
    return f"{FIRST_NAMES[seed % len(FIRST_NAMES)]} {LAST_NAMES[(seed * 3) % len(LAST_NAMES)]}"


def _category(seed: int) -> str:
    return PROVIDER_CATEGORIES[seed % len(PROVIDER_CATEGORIES)]


def _location(seed: int) -> str:
    return LOCATIONS[(seed * 2) % len(LOCATIONS)]


def _skills(category: str) -> str:
    return SKILL_MAP.get(category, "Uy xizmatlari, ta'mirlash va o'rnatish ishlari")


def _pricing(category: str) -> str:
    return PRICE_MAP.get(category, "Kelishiladi")


def _description(name: str, category: str, location: str) -> str:
    return (
        f"{name} {location} hududida {category.lower()} bo'yicha 7+ yil tajribaga ega. "
        "Tezkor chiqish, sifatli ish va kafolatli xizmat bilan ishlaydi."
    )


def _get_or_create_user(db: Session, *, email: str, full_name: str, password: str, role: UserRole) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.full_name = full_name
        user.role = role
        user.password_hash = get_password_hash(password)
        return user

    user = User(
        full_name=full_name,
        email=email,
        password_hash=get_password_hash(password),
        role=role,
    )
    db.add(user)
    db.flush()
    return user


def _ensure_customers(db: Session) -> list[User]:
    customers: list[User] = []
    for i in range(DEMO_CUSTOMER_COUNT):
        email = f"mijoz{i + 1:02d}@ustatop.uz"
        customer = _get_or_create_user(
            db,
            email=email,
            full_name=f"Mijoz {i + 1}",
            password=CUSTOMER_PASSWORD,
            role=UserRole.USER,
        )
        customers.append(customer)
    db.flush()
    return customers


def _ensure_provider_profile(db: Session, *, user: User, category: str, premium: bool, seed: int) -> ProviderProfile:
    location = _location(seed)
    profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == user.id).first()
    if not profile:
        profile = ProviderProfile(user_id=user.id)
        db.add(profile)

    profile.category = category
    profile.skills = _skills(category)
    profile.description = _description(user.full_name, category, location)
    profile.pricing = _pricing(category)
    profile.location = location
    profile.verified = True
    profile.premium = premium
    profile.average_rating = round(4.4 + (seed % 7) * 0.08, 1)
    profile.total_reviews = 0
    db.flush()
    return profile


def _seed_reviews_and_orders(db: Session, *, profile: ProviderProfile, customers: list[User], seed: int) -> None:
    existing_review = db.query(Review).filter(Review.provider_id == profile.id).first()
    if existing_review:
        avg, total = recalculate_provider_rating(db, profile.id)
        profile.average_rating = avg
        profile.total_reviews = total
        return

    review_count = 3 + (seed % 3)
    ratings: list[int] = []
    for review_index in range(review_count):
        customer = customers[(seed + review_index) % len(customers)]
        rating = 4 + ((seed + review_index) % 2)
        ratings.append(rating)

        order = Order(
            user_id=customer.id,
            provider_id=profile.id,
            title=f"{ORDER_TITLES[review_index % len(ORDER_TITLES)]} — {profile.category}",
            description=f"{profile.category} bo'yicha demo buyurtma #{seed + 1}",
            address=f"{profile.location}, {100 + seed} uy",
            status=OrderStatus.COMPLETED,
            commission=round(15 + (seed % 8) * 3.5, 2),
            provider_response="Ish bajarildi va topshirildi.",
        )
        db.add(order)
        db.flush()

        review = Review(
            user_id=customer.id,
            provider_id=profile.id,
            order_id=order.id,
            rating=rating,
            comment=REVIEW_COMMENTS[(seed + review_index) % len(REVIEW_COMMENTS)],
        )
        db.add(review)

    db.flush()
    avg = round(sum(ratings) / len(ratings), 1)
    profile.average_rating = avg
    profile.total_reviews = len(ratings)


def seed_demo_content(db: Session) -> None:
    customers = _ensure_customers(db)

    for i in range(DEMO_PROVIDER_COUNT):
        email = f"usta{i + 1:02d}@ustatop.uz"
        full_name = _full_name(i)
        category = _category(i)
        premium = i % 5 == 0

        user = _get_or_create_user(
            db,
            email=email,
            full_name=full_name,
            password=PROVIDER_PASSWORD,
            role=UserRole.PROVIDER,
        )
        profile = _ensure_provider_profile(db, user=user, category=category, premium=premium, seed=i)
        _seed_reviews_and_orders(db, profile=profile, customers=customers, seed=i)

    db.commit()
