# 🛒 Legumbría La Bendición

A full-stack supermarket management system with traceability, built with **FastAPI** + **Angular 17** + **Tailwind CSS**.

---

## 📁 Project Structure

```
supermarket/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── core/             # Config, security, DI dependencies
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── routers/          # API route handlers
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── utils/            # Pagination helpers
│   │   ├── main.py           # App entrypoint + middleware
│   │   └── database.py       # SQLAlchemy engine + session
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
└── frontend/                 # Angular 17 standalone SPA
    └── src/app/
        ├── core/             # Guards, interceptors, services
        ├── modules/          # Feature modules (auth, dashboard, suppliers, foods, transactions)
        ├── shared/           # Reusable components (toast, pagination, confirm dialog)
        ├── layouts/          # Main layout with collapsible sidebar
        └── utils/            # Helpers
```

---

## 🚀 Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+
- npm 10+

---

### Backend Setup

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env — the default uses SQLite for zero-config local dev

# 4. Start the server
uvicorn app.main:app --reload --port 8000
```

> API docs available at: http://localhost:8000/docs

---

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start dev server (proxies to localhost:8000)
npm start
```

> App available at: http://localhost:4200

---

## 🗄️ Database

### SQLite (default, zero config)
The `.env.example` uses SQLite — tables are auto-created on first run. No setup needed.

### PostgreSQL (local)
```bash
# Create DB
createdb supermarket

# Update .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/supermarket
```

### Supabase (free tier, production-ready)
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection string**
3. Copy the URI and paste it as `DATABASE_URL` in your backend `.env`

---

## 🧱 Architecture Overview

### Backend (FastAPI)

| Layer | Purpose |
|-------|---------|
| `core/config.py` | Pydantic-settings reads `.env`, provides typed config |
| `core/security.py` | bcrypt hashing + JWT encode/decode (python-jose) |
| `core/dependencies.py` | FastAPI `Depends()` — extracts + validates JWT from `Authorization: Bearer` |
| `models/` | SQLAlchemy declarative models with relationships |
| `schemas/` | Pydantic v2 schemas for validation and serialization |
| `routers/` | One router per resource, all protected with `get_current_user` |
| `utils/pagination.py` | Generic paginator — takes a SQLAlchemy `Query`, returns page dict |

### Frontend (Angular 17 Standalone)

| Layer | Purpose |
|-------|---------|
| `core/services/auth.service.ts` | Signal-based auth state, `localStorage` persistence |
| `core/interceptors/auth.interceptor.ts` | Attaches `Authorization: Bearer <token>` to every request |
| `core/guards/auth.guard.ts` | Redirects unauthenticated users to `/auth/login` |
| `core/guards/guest.guard.ts` | Redirects logged-in users away from auth pages |
| `layouts/main-layout/` | Collapsible sidebar with active route highlighting |
| `modules/` | Lazy-loaded feature modules (dashboard, suppliers, foods, transactions) |
| `shared/components/` | Toast, pagination, confirm-dialog, spinner |

### Data Flow
```
Angular Component
  → Service (HttpClient)
    → [authInterceptor adds JWT]
      → FastAPI Router
        → [get_current_user validates JWT]
          → SQLAlchemy ORM
            → PostgreSQL / SQLite
```

---

## 🌐 Deployment

### Backend → Railway

1. Push your code to GitHub
2. Create account at [railway.app](https://railway.app)
3. **New Project → Deploy from GitHub repo → Select `/backend`**
4. Add environment variables in Railway dashboard:
   ```
   DATABASE_URL=postgresql://...   (from Supabase)
   SECRET_KEY=<openssl rand -hex 32>
   ALGORITHM=HS256
   ALLOWED_ORIGINS=["https://your-app.vercel.app"]
   ```
5. Railway auto-detects the `Dockerfile` and deploys

Get your Railway URL (e.g. `https://supermarket-api.railway.app`) — you'll need it for the frontend.

---

### Frontend → Vercel

1. Update `src/environments/environment.prod.ts`:
   ```ts
   export const environment = {
     production: true,
     apiUrl: 'https://supermarket-api.railway.app/api',
   };
   ```

2. Push to GitHub

3. Create account at [vercel.com](https://vercel.com)

4. **New Project → Import from GitHub → Select `/frontend`**

5. Vercel settings:
   - **Framework**: Other (or Angular)
   - **Build Command**: `npm run build:prod`
   - **Output Directory**: `dist/supermarket-frontend/browser`

6. The included `vercel.json` handles SPA routing automatically

---

## 🔧 Extending the Project

### Add a new resource (e.g. Categories)
1. **Backend**: Create `models/category.py`, `schemas/schemas.py` additions, `routers/categories.py`
2. **Register** the router in `main.py`
3. **Frontend**: Add `core/services/category.service.ts`
4. Create `modules/categories/` with list + form components
5. Add route in `app.routes.ts` and nav item in `main-layout.component.ts`

### Add Alembic migrations (recommended for production)
```bash
cd backend
pip install alembic
alembic init alembic
# Edit alembic/env.py to use your models
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → JWT token |
| GET | `/api/auth/me` | Current user info |
| GET/POST | `/api/suppliers/` | List / create suppliers |
| GET/PUT/DELETE | `/api/suppliers/{id}` | Get / update / delete supplier |
| GET/POST | `/api/foods/` | List / create foods |
| GET | `/api/foods/all` | All foods (no pagination, for dropdowns) |
| GET/PUT/DELETE | `/api/foods/{id}` | Get / update / delete food |
| GET/POST | `/api/transactions/` | List (with filters) / create transaction |
| GET | `/api/transactions/{id}` | Transaction detail with traceability |
| GET | `/api/dashboard/stats` | Summary stats + charts data |
| GET | `/api/users/` | List users (for customer selection) |

---

## ✅ Features Checklist

- [x] JWT authentication (register + login)
- [x] Route guards (auth + guest)
- [x] HTTP interceptor (auto-attach token)
- [x] Collapsible sidebar with active route highlighting
- [x] Suppliers CRUD (with search + pagination)
- [x] Foods CRUD (with supplier join + dropdown)
- [x] Transactions (sale/purchase) with auto-calculated total
- [x] Traceability fields: batch number, origin
- [x] Anonymous or registered customer selection
- [x] Transaction filters (by food, date range)
- [x] Transaction detail with animated traceability timeline
- [x] Dashboard with summary cards and top foods bar chart
- [x] Toast notifications (success/error/info)
- [x] Confirm delete dialog
- [x] Loading spinners
- [x] Angular Animations (fade-in, stagger, slide)
- [x] Fully responsive (mobile, tablet, desktop)
- [x] Dark theme with Tailwind CSS
- [x] Environment-based API URL config
- [x] Dockerfile for backend
- [x] vercel.json for frontend SPA routing

---

## 🛡️ Security Notes

- Passwords hashed with **bcrypt** (passlib)
- JWT signed with **HS256** — change `SECRET_KEY` before production
- All API routes except `/auth/*` require a valid JWT
- CORS origins are allowlist-based (configure in `.env`)
- Never commit `.env` — add it to `.gitignore`

---

*Built with FastAPI · Angular 17 · Tailwind CSS · SQLAlchemy · PostgreSQL*
