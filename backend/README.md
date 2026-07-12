# MediMind AI Backend (FastAPI Production Boilerplate)

This is the production-ready backend repository for the **MediMind AI** ecosystem. It utilizes a highly scalable and robust **Clean Architecture / Layered Architecture** using Python 3.11+, FastAPI, SQLAlchemy 2.0, PostgreSQL, and Alembic for schema migrations.

---

## 🏗️ Architectural Overview

The codebase is engineered with strict separation of concerns to guarantee long-term maintainability, robust testability, and fast iteration:

```
backend/
├── alembic.ini                   # Alembic global settings
├── alembic/                      # Alembic migrations schema versions
│   ├── env.py
│   └── script.py.mako
├── Dockerfile                    # Multi-stage secure runner
├── docker-compose.yml            # Docker infrastructure stack (FastAPI + Postgres)
├── requirements.txt              # Standardized dependencies
├── README.md                     # Setup and Developer Guide
└── app/
    ├── main.py                   # FastAPI Application Entrypoint
    ├── dependencies.py           # Shared Dependency Injection tokens (Auth, DB)
    ├── core/                     # Globals, Security & Logging Configuration
    │   ├── config.py             # Settings Parsing (Pydantic V2 BaseSettings)
    │   ├── database.py           # Database engine/sessions init (SQLAlchemy 2.0)
    │   ├── logging_config.py     # Structured JSON vs Human-readable logs
    │   └── security.py           # Bcrypt credentials & JWT Access Tokens engine
    ├── models/                   # SQLAlchemy declarative Database Models
    │   ├── base.py               # Shared auditing timestamp Mixins
    │   └── user.py               # Credentials, active state, and roles
    ├── schemas/                  # Pydantic V2 Request & Response schemas
    │   ├── token.py              # JWT Token shapes
    │   └── user.py               # Sign-up, Sign-in, Profile output shapes
    ├── repositories/             # Database Access Repository Abstraction
    │   ├── base.py               # Shared Generic CRUD Base repository (CRUDBase)
    │   └── user_repository.py    # Specialized User-specific queries (email lookup, password hashing)
    ├── services/                 # Layer for complex Business Logic (ready to scale)
    │   ├── base.py
    │   └── auth_service.py       # Authentication services
    └── routers/                  # API endpoints organized by prefix
        └── api_v1/
            ├── api.py            # Bundler of routes under v1 space
            └── endpoints/
                ├── auth.py       # JWT creation, Login forms, Token verification
                ├── users.py      # Registration, authenticated profile, users audit
                └── health.py     # High-fidelity database connection and latency checks
```

---

## 🚀 Getting Started

You can run the backend either directly inside a local virtual environment or in a containerized environment.

### Option A: Standard Local Setup

1. **Create and Activate a Virtual Environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

2. **Install Python Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Provide Local Environment Variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   ENVIRONMENT=development
   POSTGRES_SERVER=localhost
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=securepassword123
   POSTGRES_DB=medimind_db
   SECRET_KEY=38e3e4cf6b6a3375c324fb7256241b31a89c9c0bda5029be
   ```

4. **Initialize & Run Migrations (Alembic):**
   ```bash
   # Generate your first automatic migration script based on models
   alembic revision --autogenerate -m "Initial schema setup"
   
   # Apply migration to the PostgreSQL target database
   alembic upgrade head
   ```

5. **Start the Uvicorn Dev Server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

---

### Option B: Seamless Container Setup (Recommended)

This compiles the environment and launches PostgreSQL and the FastAPI application inside a sandboxed bridge network:

```bash
# Build and boot up the microservices
docker-compose up -d --build
```

- **PostgreSQL Database** binds to port `5432` locally (username: `postgres`, password: `securepassword123`).
- **FastAPI Core Application** is accessible at `http://localhost:8000`.

---

## 📖 API Documentation & Playground

Once the server is running, explore the self-documenting Interactive REST endpoints:

- **Swagger UI (Interactive API docs):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc (Alternative static documentation):** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🔒 Security Compliance Checklist

1. **Password Hashing:** Implements asynchronous-hardened Bcrypt cryptography via `passlib`. Plain text passwords never enter storage.
2. **Access Token Handshakes:** Formats cryptographically signed JSON Web Tokens (JWT) using the `HS256` signature algorithm.
3. **Role-Based Guards:** Provides declarative dependency scopes (e.g. `get_current_active_user`, `get_current_active_superuser`) for endpoint protection.
4. **Least-Privilege Containerization:** The `Dockerfile` compiles requirements with a build layer, discarding development tooling, and executes code via a dedicated non-root standard Linux user (`appuser`).
