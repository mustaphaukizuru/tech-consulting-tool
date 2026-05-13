# 🚀 Tech Consulting Tool

**Built by [Mustapha Ukizuru](https://mustaphaukizuru.com)**

A full-stack consulting management platform — Spring Boot 3.4 + React 18 + PostgreSQL — designed to track clients, projects, tasks, and billable hours.

---

## 📦 Tech Stack

| Layer        | Technology                                                |
|--------------|-----------------------------------------------------------|
| Backend      | Java 21, Spring Boot 3.4, Spring Security, Spring Data JPA |
| Migrations   | Flyway                                                    |
| Auth         | JWT (access + refresh) via jjwt 0.12                      |
| Rate limit   | Bucket4j                                                  |
| API docs     | springdoc-openapi (Swagger UI)                            |
| Observability| Spring Boot Actuator                                      |
| Tests        | JUnit 5, MockMvc, Testcontainers (Postgres)               |
| Frontend     | React 18, TypeScript, Vite, TailwindCSS                   |
| Data         | TanStack Query, axios                                     |
| Forms        | React Hook Form + Zod                                     |
| Database     | PostgreSQL 15                                             |
| Container    | Docker + Docker Compose                                   |
| CI           | GitHub Actions + CodeQL                                   |
| Deploy       | Railway (backend + DB) + Vercel (frontend)                |

---

## 🔐 Security highlights (and what was fixed)

The previous version had a critical role-spoofing bug — any visitor could self-register as ADMIN. That, and several other issues, are now fixed:

- **Registration always assigns `CLIENT`** — backend ignores any `role` field; frontend doesn't expose one.
- **Method-level authorization** — every protected controller uses `@PreAuthorize`.
- **Ownership checks** — `@projectSecurity.canView/canEdit` ensure CLIENTs only see/edit projects tied to them.
- **JWT secret must be set in env** — startup fails if `JWT_SECRET` is < 32 bytes.
- **Access + refresh tokens** — short-lived access (1h), longer refresh (7d), signed HS256 with `iss` claim.
- **Login rate limiting** — Bucket4j caps `/api/auth/login` at 10 attempts/min per IP.
- **BCrypt cost 12** for password hashing.
- **No password leak** — entities never returned directly; all responses go through DTO mappers.
- **Generic `Invalid credentials`** message on login failure (no info leak).
- **Flyway migrations** — `ddl-auto=validate` so schema drift can't quietly happen in prod.
- **CSP-like nginx headers** + non-root Docker images.

---

## 📁 Project Structure

```
tech-consulting-tool/
├── backend/                        # Spring Boot 3.4 + Java 21
│   ├── src/main/java/com/ukizuru/consulting/
│   │   ├── ConsultingApplication.java
│   │   ├── config/                 # SecurityConfig, JwtUtil, JwtRequestFilter,
│   │   │                           # LoginRateLimitFilter, OpenApiConfig
│   │   ├── controllers/            # Auth / Project / Client / Task / TimeEntry
│   │   ├── services/               # Same plus mappers
│   │   ├── security/               # CurrentUser, ProjectSecurity (@PreAuthorize bean)
│   │   ├── models/                 # User, Client, Project, Task, TimeEntry, BaseEntity
│   │   ├── repositories/           # Spring Data interfaces
│   │   ├── dto/                    # All requests/responses as Java records
│   │   └── exception/              # ApiException + GlobalExceptionHandler (ProblemDetail)
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── application-prod.properties
│   │   └── db/migration/V1__init.sql
│   ├── src/test/java/...           # AuthFlowTest with Testcontainers
│   ├── Dockerfile                  # Multi-stage, non-root, HEALTHCHECK
│   └── pom.xml
│
├── frontend/                       # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx, main.tsx, index.css
│   │   ├── pages/                  # Login, Register, Dashboard, Projects,
│   │   │                           # ProjectDetail, Clients, ClientDetail, TimeEntries
│   │   ├── components/             # AppShell, Navbar, ProtectedRoute, ErrorBoundary
│   │   │   └── ui/                 # Modal, StatusBadge, EmptyState, Spinner
│   │   ├── hooks/                  # useAuth
│   │   ├── services/               # Typed axios wrappers per resource
│   │   ├── lib/                    # api, queryClient, storage, authEvents, utils
│   │   └── types/                  # Shared TS types matching backend DTOs
│   ├── Dockerfile                  # nginx, non-root, security headers
│   ├── nginx.conf
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── .github/workflows/              # backend.yml, frontend.yml, codeql.yml
├── docker-compose.yml              # Full local stack (db / backend / frontend)
├── .env.example                    # Required env vars
└── README.md
```

---

## 🔑 API Endpoints

Full interactive docs available at `http://localhost:8080/swagger-ui.html` once running.

### Auth (`/api/auth`) — public

| Method | Endpoint    | Description                              |
|--------|-------------|------------------------------------------|
| POST   | `/register` | Register a new user (always created as CLIENT) |
| POST   | `/login`    | Login → returns access + refresh tokens  |
| POST   | `/refresh`  | Exchange refresh token for new pair      |

### Projects (`/api/projects`) — authenticated

| Method | Endpoint            | Auth requirement                                      |
|--------|---------------------|-------------------------------------------------------|
| GET    | `/`                 | Any role (CLIENT sees only their own)                 |
| GET    | `/{id}`             | `projectSecurity.canView(id)`                         |
| POST   | `/`                 | `ADMIN` or `CONSULTANT`                               |
| PUT    | `/{id}`             | `projectSecurity.canEdit(id)`                         |
| DELETE | `/{id}`             | `ADMIN` or `projectSecurity.canEdit(id)`              |

Query params on `GET /`: `q`, `status`, `page`, `size`, `sort`.

### Clients (`/api/clients`) — authenticated

| Method | Endpoint     | Auth requirement       |
|--------|--------------|------------------------|
| GET    | `/`          | Any role               |
| GET    | `/{id}`      | Any role               |
| POST   | `/`          | `ADMIN` or `CONSULTANT`|
| PUT    | `/{id}`      | `ADMIN` or `CONSULTANT`|
| DELETE | `/{id}`      | `ADMIN`                |

### Tasks (`/api/projects/{projectId}/tasks` + `/api/tasks/{id}`)
Scoped to project visibility/edit rules.

### Time entries (`/api/time-entries`, `/api/projects/{projectId}/time-entries`)
Each user can edit/delete only their own entries; admins can edit any. Project summary endpoint returns `{ totalMinutes, billableMinutes, totalRevenueCents }`.

### Observability

| Endpoint                      | Auth          |
|-------------------------------|---------------|
| `/actuator/health`            | public        |
| `/actuator/info`              | public        |
| `/actuator/metrics`           | `ADMIN`       |
| `/actuator/prometheus`        | `ADMIN`       |
| `/swagger-ui.html`            | public (dev)  |

---

## 🖥️ Local Development

### Prerequisites
- Java 21+, Maven 3.9+
- Node.js 20+
- Docker Desktop (for Postgres + integration tests)

### Option A — Docker Compose (recommended)

```bash
# 1. Clone
git clone https://github.com/mustaphaukizuru/tech-consulting-tool.git
cd tech-consulting-tool

# 2. Configure env
cp .env.example .env
# edit .env — at minimum set POSTGRES_PASSWORD and JWT_SECRET
# JWT_SECRET should be at least 32 chars. Generate with:
#   openssl rand -base64 48

# 3. Start everything
docker compose up --build

# Frontend  → http://localhost:3000
# Backend   → http://localhost:8080
# Swagger   → http://localhost:8080/swagger-ui.html
# Database  → localhost:5432
```

### Option B — Run services individually

```bash
# Terminal 1 — Postgres
docker run -d --name consulting_db \
  -e POSTGRES_DB=consulting_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:15-alpine

# Terminal 2 — Backend
cd backend
export JWT_SECRET="$(openssl rand -base64 48)"
mvn spring-boot:run

# Terminal 3 — Frontend
cd frontend
cp .env.example .env.local
npm ci
npm run dev   # http://localhost:5173
```

---

## 🧪 Testing

```bash
# Backend (uses Testcontainers — needs Docker running)
cd backend && mvn verify

# Frontend
cd frontend && npm run typecheck && npm test
```

---

## ☁️ Deployment

### Backend → Railway

1. Push to GitHub.
2. Railway → New Project → Deploy from GitHub → select the repo, root `backend/`.
3. Railway auto-detects the Dockerfile.
4. Add a PostgreSQL plugin — Railway injects `DATABASE_URL`.
5. Set these env vars on the backend service:
   ```
   SPRING_PROFILES_ACTIVE=prod
   JWT_SECRET=<openssl rand -base64 48>
   CORS_ORIGINS=https://your-app.vercel.app
   ```
6. The Dockerfile's HEALTHCHECK hits `/actuator/health/liveness`.

### Frontend → Vercel

1. Vercel → Add New Project → import the repo, root `frontend/`.
2. Build Command: `npm run build` · Output Directory: `dist`.
3. Env vars:
   ```
   VITE_API_URL=https://<your-backend>.up.railway.app/api
   ```
4. Update `CORS_ORIGINS` on Railway to match the Vercel URL.

---

## 🔐 Environment Variables Reference

### Backend

| Variable                       | Default                            | Required in prod |
|--------------------------------|------------------------------------|------------------|
| `SPRING_PROFILES_ACTIVE`       | `dev`                              | ✅ set to `prod` |
| `DATABASE_URL`                 | `jdbc:postgresql://localhost:5432/consulting_db` | ✅ Railway auto |
| `DB_USERNAME`                  | `postgres`                         | ✅               |
| `DB_PASSWORD`                  | `postgres`                         | ✅               |
| `JWT_SECRET`                   | dev-only fallback                  | ✅ **32+ bytes** |
| `JWT_EXPIRATION_MS`            | `3600000` (1h)                     | optional         |
| `JWT_REFRESH_EXPIRATION_MS`    | `604800000` (7d)                   | optional         |
| `CORS_ORIGINS`                 | localhost dev origins              | ✅               |
| `PORT`                         | `8080`                             | Railway auto     |

### Frontend

| Variable        | Default | Required in prod |
|-----------------|---------|------------------|
| `VITE_API_URL`  | `/api`  | ✅ point at backend URL |

---

## 🧩 What's next (P2/P3 features deferred)

These are intentionally left for future work — they each need external accounts or non-trivial scope:

- **Invoicing** — PDF generation + Stripe checkout
- **File uploads** — Cloudflare R2 / S3 storage
- **Email notifications** — Spring Mail + SMTP
- **Real-time updates** — WebSockets / SSE
- **Tailwind 4 / React 19** — defer until ecosystem catches up
- **Prometheus dashboards** — Grafana Cloud setup

---

## 👨‍💻 Author

**Mustapha Ukizuru** · [mustaphaukizuru.com](https://mustaphaukizuru.com) · [LinkedIn](https://linkedin.com/in/mustaphaukizuru) · [GitHub](https://github.com/mustaphaukizuru)
