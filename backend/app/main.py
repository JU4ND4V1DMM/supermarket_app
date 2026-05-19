from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base
from app.routers import auth, suppliers, foods, transactions, users, dashboard
from app.core.config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Supermarket API v2", version="2.0.0")

# ── CORS ─────────────────────────────────────────────────────────────────────
# Must be added FIRST, before any router.
# We also add a manual OPTIONS handler as fallback for strict clients.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"http://localhost:\d+",   # allow any localhost port in dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,         prefix="/api/auth",         tags=["auth"])
app.include_router(users.router,        prefix="/api/users",        tags=["users"])
app.include_router(suppliers.router,    prefix="/api/suppliers",    tags=["suppliers"])
app.include_router(foods.router,        prefix="/api/foods",        tags=["foods"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])
app.include_router(dashboard.router,    prefix="/api/dashboard",    tags=["dashboard"])


@app.get("/health")
def health():
    return {
        "status": "ok",
        "version": "2.0.0",
        "allowed_origins": settings.ALLOWED_ORIGINS,
    }


@app.on_event("startup")
def startup_info():
    print("\n" + "─" * 60)
    print("  Supermarket API v2 — Iniciando")
    print(f"  DB  : {settings.DATABASE_URL}")
    print(f"  CORS: {settings.ALLOWED_ORIGINS}")
    print("─" * 60 + "\n")
