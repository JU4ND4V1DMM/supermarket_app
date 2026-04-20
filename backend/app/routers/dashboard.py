from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.supplier import Supplier
from app.models.food import Food
from app.models.transaction import Transaction
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    total_suppliers = db.query(func.count(Supplier.id)).scalar()
    total_foods = db.query(func.count(Food.id)).scalar()
    total_transactions = db.query(func.count(Transaction.id)).scalar()
    total_revenue = db.query(func.sum(Transaction.total)).scalar() or 0

    # Recent 5 transactions
    recent = (
        db.query(Transaction)
        .order_by(Transaction.created_at.desc())
        .limit(5)
        .all()
    )

    # Transactions per food (top 10 by count)
    food_stats = (
        db.query(Food.name, func.count(Transaction.id).label("count"), func.sum(Transaction.total).label("revenue"))
        .join(Transaction, Transaction.food_id == Food.id, isouter=True)
        .group_by(Food.id, Food.name)
        .order_by(func.count(Transaction.id).desc())
        .limit(10)
        .all()
    )

    return {
        "total_suppliers": total_suppliers,
        "total_foods": total_foods,
        "total_transactions": total_transactions,
        "total_revenue": round(total_revenue, 2),
        "food_stats": [
            {"name": row.name, "count": row.count, "revenue": round(row.revenue or 0, 2)}
            for row in food_stats
        ],
        "recent_transactions": [
            {
                "id": t.id,
                "food_id": t.food_id,
                "quantity": t.quantity,
                "total": t.total,
                "transaction_type": t.transaction_type,
                "is_anonymous": t.is_anonymous,
                "created_at": t.created_at,
            }
            for t in recent
        ],
    }
