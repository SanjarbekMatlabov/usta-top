import enum


class UserRole(str, enum.Enum):
    USER = "user"
    PROVIDER = "provider"
    ADMIN = "admin"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
