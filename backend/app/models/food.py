from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    purchase_price = Column(Float, nullable=False)   # Precio de compra (lo que pagamos al proveedor)
    sale_price = Column(Float, nullable=False)        # Precio de venta (lo que cobra el almacén)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    supplier = relationship("Supplier", back_populates="foods")
    transaction_items = relationship("TransactionItem", back_populates="food")
