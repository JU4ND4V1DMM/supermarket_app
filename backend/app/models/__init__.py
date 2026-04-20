# Import all models so SQLAlchemy registers them before create_all
from app.models.user import User
from app.models.supplier import Supplier
from app.models.food import Food
from app.models.transaction import Transaction
