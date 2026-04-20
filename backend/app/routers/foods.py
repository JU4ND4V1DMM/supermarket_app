from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.user import User
from app.models.food import Food
from app.models.supplier import Supplier
from app.schemas.schemas import FoodCreate, FoodUpdate, FoodOut
from app.core.dependencies import get_current_user
from app.utils.pagination import paginate

router = APIRouter()


@router.get("/")
def list_foods(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str = Query("", description="Filter by food name"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Food).options(joinedload(Food.supplier))
    if search:
        query = query.filter(Food.name.ilike(f"%{search}%"))
    query = query.order_by(Food.created_at.desc())
    return paginate(query, page, page_size)


@router.get("/all", response_model=list[FoodOut])
def list_foods_all(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Return all foods (no pagination) for dropdown selects."""
    return db.query(Food).options(joinedload(Food.supplier)).all()


@router.post("/", response_model=FoodOut, status_code=201)
def create_food(
    payload: FoodCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if not db.query(Supplier).filter(Supplier.id == payload.supplier_id).first():
        raise HTTPException(status_code=404, detail="Supplier not found")

    food = Food(**payload.model_dump())
    db.add(food)
    db.commit()
    db.refresh(food)
    # Reload with supplier for the response
    return db.query(Food).options(joinedload(Food.supplier)).filter(Food.id == food.id).first()


@router.get("/{food_id}", response_model=FoodOut)
def get_food(
    food_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    food = db.query(Food).options(joinedload(Food.supplier)).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    return food


@router.put("/{food_id}", response_model=FoodOut)
def update_food(
    food_id: int,
    payload: FoodUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(food, field, value)

    db.commit()
    db.refresh(food)
    return db.query(Food).options(joinedload(Food.supplier)).filter(Food.id == food.id).first()


@router.delete("/{food_id}", status_code=204)
def delete_food(
    food_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    db.delete(food)
    db.commit()
