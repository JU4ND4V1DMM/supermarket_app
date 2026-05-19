from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.supplier import Supplier
from app.models.food import Food
from app.models.transaction import Transaction, TransactionItem, TransactionType
from app.core.dependencies import get_current_user

router = APIRouter()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    total_suppliers = db.query(func.count(Supplier.id)).scalar()
    total_foods = db.query(func.count(Food.id)).scalar()
    total_transactions = db.query(func.count(Transaction.id)).scalar()

    total_sales = db.query(func.sum(Transaction.total)).filter(Transaction.transaction_type == TransactionType.sale).scalar() or 0
    total_purchases = db.query(func.sum(Transaction.total)).filter(Transaction.transaction_type == TransactionType.purchase).scalar() or 0
    total_profit = total_sales - total_purchases

    recent = db.query(Transaction).order_by(Transaction.created_at.desc()).limit(5).all()

    food_stats = (
        db.query(Food.name, func.sum(TransactionItem.quantity).label("count"), func.sum(TransactionItem.subtotal).label("revenue"))
        .join(TransactionItem, TransactionItem.food_id == Food.id, isouter=True)
        .join(Transaction, Transaction.id == TransactionItem.transaction_id, isouter=True)
        .filter(Transaction.transaction_type == TransactionType.sale)
        .group_by(Food.id, Food.name)
        .order_by(func.sum(TransactionItem.subtotal).desc())
        .limit(10).all()
    )

    return {
        "total_suppliers": total_suppliers,
        "total_foods": total_foods,
        "total_transactions": total_transactions,
        "total_sales": round(total_sales, 2),
        "total_purchases": round(total_purchases, 2),
        "total_profit": round(total_profit, 2),
        "food_stats": [{"name": r.name, "count": r.count or 0, "revenue": round(r.revenue or 0, 2)} for r in food_stats],
        "recent_transactions": [
            {"id": t.id, "total": t.total, "transaction_type": t.transaction_type, "is_anonymous": t.is_anonymous, "created_at": t.created_at}
            for t in recent
        ],
    }
