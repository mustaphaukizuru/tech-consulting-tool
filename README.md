# 🚀 Tech Consulting Tool
**Built by [Mustapha Ukizuru](https://mustaphaukizuru.com)**

A full-stack consulting management platform built with **Spring Boot 3 + React + PostgreSQL**.

---

## 📦 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Java 17, Spring Boot 3, Maven     |
| Frontend   | React 18, Vite, TailwindCSS       |
| Database   | PostgreSQL 15                     |
| Auth       | Spring Security + JWT             |
| Container  | Docker + Docker Compose           |
| Deploy     | Railway (backend) + Vercel (frontend) |

---

## 📁 Project Structure

```
tech-consulting-tool/
├── backend/                        # Spring Boot API
│   ├── src/main/java/com/ukizuru/consulting/
│   │   ├── controllers/            # REST endpoints
│   │   ├── services/               # Business logic
│   │   ├── models/                 # JPA entities
│   │   ├── repositories/           # Spring Data repos
│   │   ├── config/                 # Security, JWT, CORS
│   │   └── dto/                    # Data Transfer Objects
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                       # React + Vite SPA
│   ├── src/
│   │   ├── pages/                  # Login, Register, Dashboard, Projects
│   │   ├── components/             # Navbar, ProtectedRoute
│   │   ├── hooks/                  # useAuth (AuthContext)
│   │   └── services/               # Axios API client
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml              # Full local stack
├── .gitignore
└── README.md
```

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint             | Description       | Auth |
|--------|----------------------|-------------------|------|
| POST   | /api/auth/register   | Register new user | ❌   |
| POST   | /api/auth/login      | Login & get token | ❌   |

### Projects
| Method | Endpoint                    | Description          | Auth |
|--------|-----------------------------|----------------------|------|
| GET    | /api/projects               | List all projects    | ✅   |
| GET    | /api/projects/:id           | Get single project   | ✅   |
| POST   | /api/projects               | Create project       | ✅   |
| PUT    | /api/projects/:id           | Update project       | ✅   |
| DELETE | /api/projects/:id           | Delete project       | ✅   |
| GET    | /api/projects/client/:id    | Projects by client   | ✅   |

---

## 🖥️ Local Development

### Prerequisites
- Java 17+
- Node.js 20+
- Docker Desktop
- Maven 3.9+

### Option A — Run with Docker (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/mustaphaukizuru/tech-consulting-tool.git
cd tech-consulting-tool

# 2. Start everything (DB + Backend + Frontend)
docker-compose up --build

# App is now running at:
# Frontend  → http://localhost:3000
# Backend   → http://localhost:8080
# Database  → localhost:5432
```

### Option B — Run manually

**Terminal 1 — Database**
```bash
docker run -d \
  --name consulting_db \
  -e POSTGRES_DB=consulting_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

**Terminal 2 — Backend**
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

**Terminal 3 — Frontend**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## ☁️ FREE Deployment Guide

### 🟣 Backend → Railway (Free Tier)

Railway gives you **$5/month free credits** — enough for a small Spring Boot app + PostgreSQL.

#### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/mustaphaukizuru/tech-consulting-tool.git
git push -u origin main
```

#### Step 2 — Deploy on Railway
1. Go to **[railway.app](https://railway.app)** → Sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `tech-consulting-tool` → choose the **`backend`** folder as root
4. Railway auto-detects the Dockerfile ✅

#### Step 3 — Add PostgreSQL on Railway
1. In your Railway project → click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway auto-injects `DATABASE_URL` into your service ✅

#### Step 4 — Set Environment Variables on Railway
Go to your backend service → **Variables** tab → add:
```
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
CORS_ORIGINS=https://your-app.vercel.app
```

#### Step 5 — Get your backend URL
Railway gives you a public URL like:
`https://tech-consulting-backend.up.railway.app`

---

### 🔵 Frontend → Vercel (Free Forever)

Vercel is the best free host for React/Vite apps — no cold starts, global CDN.

#### Step 1 — Set the API URL
Create `frontend/.env.production`:
```
VITE_API_URL=https://tech-consulting-backend.up.railway.app/api
```

#### Step 2 — Deploy on Vercel
1. Go to **[vercel.com](https://vercel.com)** → Sign in with GitHub
2. Click **"Add New Project"** → Import `tech-consulting-tool`
3. Set **Root Directory** to `frontend`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Add Environment Variable:
   ```
   VITE_API_URL = https://tech-consulting-backend.up.railway.app/api
   ```
7. Click **Deploy** 🚀

#### Step 3 — Update CORS on Railway
Go back to Railway → backend Variables → update:
```
CORS_ORIGINS=https://your-project.vercel.app
```

---

### ✅ Final Architecture (Free)

```
Users
  │
  ▼
Vercel (Frontend - React)          FREE ∞
  │  HTTPS API calls
  ▼
Railway (Backend - Spring Boot)    FREE $5/mo credits
  │  JDBC
  ▼
Railway (PostgreSQL)               FREE included
```

---

## 🔐 Environment Variables Reference

### Backend
| Variable        | Default                        | Required in Prod |
|-----------------|--------------------------------|-----------------|
| DATABASE_URL    | jdbc:postgresql://localhost... | ✅ (Railway auto) |
| DB_USERNAME     | postgres                       | ✅              |
| DB_PASSWORD     | postgres                       | ✅              |
| JWT_SECRET      | ukizuru-...                    | ✅ Change this! |
| CORS_ORIGINS    | http://localhost:5173          | ✅              |
| PORT            | 8080                           | Railway auto    |

### Frontend
| Variable      | Default  | Required in Prod |
|---------------|----------|-----------------|
| VITE_API_URL  | /api     | ✅              |

---

## 🧩 Extending the App

| Feature         | What to add                                    |
|-----------------|------------------------------------------------|
| Email alerts    | Add Spring Mail + Gmail SMTP                  |
| File uploads    | Add Cloudinary SDK                            |
| Payments        | Add Stripe Spring Boot starter                |
| Real-time chat  | Add WebSocket (Spring + Stomp)                |
| Analytics       | Add a `/api/stats` endpoint                   |

---

## 👨‍💻 Author

**Mustapha Ukizuru**
- 🌐 [mustaphaukizuru.com](https://mustaphaukizuru.com)
- 💼 [LinkedIn](https://linkedin.com/in/mustaphaukizuru)
- 🐙 [GitHub](https://github.com/mustaphaukizuru)
- 🐦 [@ukizurumustapha](https://twitter.com/ukizurumustapha)
