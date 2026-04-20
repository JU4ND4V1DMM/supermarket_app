from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.food import Food
from app.models.transaction import Transaction
from app.schemas.schemas import TransactionCreate, TransactionOut
from app.core.dependencies import get_current_user
from app.utils.pagination import paginate

router = APIRouter()


@router.get("/")
def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    food_id: Optional[int] = Query(None),
    customer_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = (
        db.query(Transaction)
        .options(
            joinedload(Transaction.food).joinedload(Food.supplier),
            joinedload(Transaction.customer),
        )
    )

    if food_id:
        query = query.filter(Transaction.food_id == food_id)
    if customer_id:
        query = query.filter(Transaction.customer_id == customer_id)
    if date_from:
        query = query.filter(Transaction.created_at >= date_from)
    if date_to:
        query = query.filter(Transaction.created_at <= date_to)

    query = query.order_by(Transaction.created_at.desc())
    return paginate(query, page, page_size)


@router.post("/", response_model=TransactionOut, status_code=201)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    food = db.query(Food).filter(Food.id == payload.food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    # Validate registered customer exists if provided
    if not payload.is_anonymous and payload.customer_id:
        customer = db.query(User).filter(User.id == payload.customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

    # Auto-calculate total
    total = food.price * payload.quantity

    transaction = Transaction(
        food_id=payload.food_id,
        quantity=payload.quantity,
        total=total,
        transaction_type=payload.transaction_type,
        batch_number=payload.batch_number,
        origin=payload.origin,
        is_anonymous=payload.is_anonymous,
        customer_id=payload.customer_id if not payload.is_anonymous else None,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return (
        db.query(Transaction)
        .options(
            joinedload(Transaction.food).joinedload(Food.supplier),
            joinedload(Transaction.customer),
        )
        .filter(Transaction.id == transaction.id)
        .first()
    )


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    transaction = (
        db.query(Transaction)
        .options(
            joinedload(Transaction.food).joinedload(Food.supplier),
            joinedload(Transaction.customer),
        )
        .filter(Transaction.id == transaction_id)
        .first()
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction
