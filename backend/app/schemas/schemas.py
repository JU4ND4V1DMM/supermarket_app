from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.transaction import TransactionType

# ─────────────────────────── AUTH ───────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─────────────────────────── SUPPLIER ───────────────────────────

class SupplierCreate(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None


class SupplierOut(BaseModel):
    id: int
    name: str
    contact_person: Optional[str]
    phone: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────── FOOD ───────────────────────────

class FoodCreate(BaseModel):
    name: str
    price: float
    supplier_id: int

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Price must be positive")
        return v


class FoodUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    supplier_id: Optional[int] = None


class FoodOut(BaseModel):
    id: int
    name: str
    price: float
    supplier_id: int
    supplier: Optional[SupplierOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────── TRANSACTION ───────────────────────────

class TransactionCreate(BaseModel):
    food_id: int
    quantity: int
    transaction_type: TransactionType = TransactionType.sale
    batch_number: Optional[str] = None
    origin: Optional[str] = None
    is_anonymous: bool = True
    customer_id: Optional[int] = None

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be positive")
        return v


class TransactionOut(BaseModel):
    id: int
    food_id: int
    food: Optional[FoodOut] = None
    quantity: int
    total: float
    transaction_type: TransactionType
    batch_number: Optional[str]
    origin: Optional[str]
    is_anonymous: bool
    customer_id: Optional[int]
    customer: Optional[UserOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────── PAGINATION ───────────────────────────

class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int
