from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.food import Food
from app.models.transaction import Transaction, TransactionItem, TransactionType
from app.schemas.schemas import TransactionCreate, TransactionOut
from app.core.dependencies import get_current_user, get_current_user_optional
from app.utils.pagination import paginate

router = APIRouter()

def _load(db, tx_id):
    return (db.query(Transaction)
        .options(
            joinedload(Transaction.items).joinedload(TransactionItem.food).joinedload(Food.supplier),
            joinedload(Transaction.customer))
        .filter(Transaction.id == tx_id).first())

@router.get("/")
def list_transactions(
    page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100),
    transaction_type: Optional[TransactionType] = Query(None),
    date_from: Optional[date] = Query(None), date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db), 
    _: User = Depends(get_current_user),
):
    q = (db.query(Transaction)
         .options(
             joinedload(Transaction.items).joinedload(TransactionItem.food).joinedload(Food.supplier),
             joinedload(Transaction.customer)))
    if transaction_type: 
        q = q.filter(Transaction.transaction_type == transaction_type)
    if date_from: 
        q = q.filter(Transaction.created_at >= date_from)
    if date_to: 
        q = q.filter(Transaction.created_at <= date_to)
    return paginate(q.order_by(Transaction.created_at.desc()), page, page_size)

@router.post("/", response_model=TransactionOut, status_code=201)
def create_transaction(
    payload: TransactionCreate, 
    db: Session = Depends(get_db), 
    _: User = Depends(get_current_user)
):
    if not payload.is_anonymous and payload.customer_id:
        if not db.query(User).filter(User.id == payload.customer_id).first():
            raise HTTPException(status_code=404, detail="Cliente no encontrado")

    tx = Transaction(
        transaction_type=payload.transaction_type,
        batch_number=payload.batch_number,
        origin=payload.origin,
        notes=payload.notes,
        is_anonymous=payload.is_anonymous,
        customer_id=payload.customer_id if not payload.is_anonymous else None,
        total=0.0,
    )
    db.add(tx)
    db.flush()

    total = 0.0
    for item_data in payload.items:
        food = db.query(Food).filter(Food.id == item_data.food_id).first()
        if not food:
            raise HTTPException(status_code=404, detail=f"Producto {item_data.food_id} no encontrado")
        unit_price = food.sale_price if payload.transaction_type == TransactionType.sale else food.purchase_price
        subtotal = unit_price * item_data.quantity
        total += subtotal
        db.add(TransactionItem(
            transaction_id=tx.id,
            food_id=food.id,
            quantity=item_data.quantity,
            unit_price=unit_price,
            subtotal=subtotal
        ))

    tx.total = round(total, 2)
    db.commit()
    db.refresh(tx)
    return _load(db, tx.id)

@router.get("/{tx_id}", response_model=TransactionOut)
def get_transaction(
    tx_id: int, 
    db: Session = Depends(get_db), 
    _: Optional[User] = Depends(get_current_user_optional)
):
    tx = _load(db, tx_id)
    if not tx: 
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    return tx

@router.delete("/{tx_id}", status_code=204)
def delete_transaction(
    tx_id: int, 
    db: Session = Depends(get_db), 
    _: User = Depends(get_current_user)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx: 
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    db.delete(tx)
    db.commit()