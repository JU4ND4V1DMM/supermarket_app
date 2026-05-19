from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class TransactionType(str, enum.Enum):
    sale = "sale"
    purchase = "purchase"


class Transaction(Base):
    """Encabezado de una transacción (puede tener múltiples ítems)."""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_type = Column(Enum(TransactionType), default=TransactionType.sale)
    total = Column(Float, nullable=False, default=0.0)

    # Trazabilidad
    batch_number = Column(String, nullable=True)
    origin = Column(String, nullable=True)
    notes = Column(String, nullable=True)

    # Cliente
    is_anonymous = Column(Boolean, default=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("TransactionItem", back_populates="transaction", cascade="all, delete-orphan")
    customer = relationship("User", back_populates="transactions", foreign_keys=[customer_id])


class TransactionItem(Base):
    """Línea de ítem dentro de una transacción."""
    __tablename__ = "transaction_items"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    transaction = relationship("Transaction", back_populates="items")
    food = relationship("Food", back_populates="transaction_items")
