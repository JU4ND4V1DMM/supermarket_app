from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class TransactionType(str, enum.Enum):
    sale = "sale"
    purchase = "purchase"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total = Column(Float, nullable=False)
    transaction_type = Column(Enum(TransactionType), default=TransactionType.sale)

    # Traceability fields
    batch_number = Column(String, nullable=True)
    origin = Column(String, nullable=True)

    # Customer: anonymous or registered
    is_anonymous = Column(Boolean, default=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    food = relationship("Food", back_populates="transactions")
    customer = relationship("User", back_populates="transactions", foreign_keys=[customer_id])
