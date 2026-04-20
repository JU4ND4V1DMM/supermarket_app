from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, suppliers, foods, transactions, users, dashboard
from app.core.config import settings

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Supermarket Management API",
    description="Backend API for supermarket management with traceability",
    version="1.0.0",
)

# CORS — allow Angular dev server and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(suppliers.router, prefix="/api/suppliers", tags=["suppliers"])
app.include_router(foods.router, prefix="/api/foods", tags=["foods"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])


@app.get("/")
def root():
    return {"message": "Supermarket Management API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
