from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.schemas import UserOut
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List all users — used for selecting registered customers in transactions."""
    return db.query(User).filter(User.is_active == True).all()
