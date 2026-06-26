# ⚡ IncidentIQ

A lightweight, full-stack **Incident Management** application.

> **Developed by: Prashant Verma**

- **Backend:** Node.js + Express + PostgreSQL + Prisma ORM — **TypeScript**
- **Frontend:** React + Vite + Tailwind CSS — **TypeScript**, modern dark dashboard UI (lucide-react icons, toasts, skeletons)
- **Auth:** JWT access + refresh tokens (with rotation), every API protected
- **Server-side:** validation, filtering, search, and pagination

---

## Features

- Register / Login with JWT (access + refresh token rotation)
- Every incident API requires a valid `Authorization: Bearer <accessToken>`
- Automatic silent token refresh on the frontend (axios interceptor)
- Create, list, view, and update incident status
- Server-side **filtering** (severity, status), **search** (title/description), **pagination**, and **sorting**
- Audit columns (`createdBy` / `updatedBy`) on every table
- Responsive UI with Tailwind
- Basic tests (Vitest on backend, Vitest + RTL on frontend)
- Fully typed end-to-end (shared domain types, typed API client, typed Express layer)
- **🤖 AI insights** (open-source LLM): incident **summaries**, **severity recommendations**, and **root-cause suggestions**

---

## 🤖 AI Insights (open-source LLM)

Three AI-assisted features, all behind auth:

| Feature | Where | Endpoint |
|---|---|---|
| Severity recommendation | "Suggest with AI" in the create modal | `POST /api/ai/severity` |
| Incident summary | "Summarize" in the detail drawer | `GET /api/ai/incidents/:id/summary` |
| Root-cause suggestions | "Root-cause" in the detail drawer | `GET /api/ai/incidents/:id/root-cause` |
| **Chatbot assistant** | Floating chat widget on the dashboard | `POST /api/ai/chat` |

The chatbot is **grounded in live data** — each request injects a compact snapshot of
current incidents (counts by severity/status + recent titles) so answers reflect the real
state, not hallucinations.

The backend calls any **OpenAI-compatible** `/chat/completions` endpoint, so you can use a
fully open-source model. Configure in `backend/.env`:

```bash
# Groq (free, hosted open-weight Llama 3.3)
LLM_BASE_URL="https://api.groq.com/openai/v1"
LLM_API_KEY="gsk_..."
LLM_MODEL="llama-3.3-70b-versatile"

# — or — Ollama (fully local / open source: `ollama run llama3.1`)
LLM_BASE_URL="http://localhost:11434/v1"
LLM_API_KEY=""
LLM_MODEL="llama3.1"
```

> If `LLM_BASE_URL` is left empty, the API uses a transparent rule-based fallback
> (keyword heuristics) so the feature still works without any external setup — each
> response is labeled with its source (`fallback` vs the model name).

---

## Project Structure

```
IncidentIQ/
├── backend/      # Express REST API
│   ├── prisma/   # schema.prisma + seed
│   └── src/      # routes, controllers, services, middleware, validators
├── frontend/     # React + Vite app
│   └── src/      # pages, components, api client, context
└── README.md
```

---

## Prerequisites

- Node.js >= 18
- PostgreSQL running locally **or** Docker (see options below)

---

## Quick Start with Docker

### Option A — Full stack in Docker (DB + API + UI)

```bash
docker compose up --build
```

- Frontend → http://localhost:5173
- Backend  → http://localhost:4000
- Postgres → localhost:5433 (host) / `db:5432` (in-network)

The backend container automatically runs `prisma migrate deploy`, seeds demo data,
then starts the API. Demo login: `admin@incidentiq.dev` / `password123`.

### Option B — Only Postgres in Docker, run apps locally

Use this if you want hot-reload dev servers but don't want to install Postgres.

```bash
docker compose up -d db        # Postgres exposed on host port 5433
```

Then point `backend/.env` at it:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/incidentiq?schema=public"
```

> Note: host port **5433** is used to avoid clashing with any Postgres already on 5432.

Then follow the manual backend/frontend steps below.

To stop and wipe the database volume:

```bash
docker compose down -v
```

---

## 1. Backend Setup

```bash
cd backend
npm install

# configure environment
cp .env.example .env
# edit .env -> set DATABASE_URL and JWT secrets

# create DB schema
npm run prisma:generate
npm run prisma:migrate     # name the migration e.g. "init"

# (optional) seed sample data + demo user
npm run prisma:seed

# run the API
npm run dev                # http://localhost:4000
```

**Demo login** (after seeding): `admin@incidentiq.dev` / `password123`

### Backend tests

```bash
npm test
```

---

## 2. Frontend Setup

```bash
cd frontend
npm install

cp .env.example .env       # VITE_API_URL defaults to http://localhost:4000/api

npm run dev                # http://localhost:5173
```

### Frontend tests

```bash
npm test
```

---

## API Reference

Base URL: `http://localhost:4000/api`

### Auth

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/auth/register` | – | `{ name, email, password }` |
| POST | `/auth/login` | – | `{ email, password }` |
| POST | `/auth/refresh` | – | `{ refreshToken }` |
| POST | `/auth/logout` | ✅ | – |
| GET | `/auth/me` | ✅ | – |

Auth success returns:
```json
{ "data": { "user": {...}, "accessToken": "...", "refreshToken": "..." } }
```

### Incidents (all require `Authorization: Bearer <accessToken>`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/incidents` | Create incident |
| GET | `/incidents` | List with filter/search/pagination |
| GET | `/incidents/:id` | Get incident details |
| PATCH | `/incidents/:id/status` | Update status |

**List query params (server-side):**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `severity` | enum | – | LOW / MEDIUM / HIGH / CRITICAL |
| `status` | enum | – | OPEN / IN_PROGRESS / RESOLVED / CLOSED |
| `search` | string | – | matches title or description (case-insensitive) |
| `page` | int | 1 | |
| `pageSize` | int | 10 | max 100 |
| `sortBy` | enum | createdAt | createdAt/updatedAt/severity/status/title |
| `sortOrder` | enum | desc | asc / desc |

List response:
```json
{
  "data": [ ...incidents ],
  "pagination": { "page": 1, "pageSize": 10, "total": 42, "totalPages": 5 }
}
```

### Error envelope

```json
{ "error": { "message": "Validation failed", "details": [ { "field": "title", "message": "..." } ] } }
```

---

## Enums

- **Severity:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- **Status:** `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

---

## Architecture Notes

- **Layered backend:** routes → controllers → services → Prisma. Validation and auth are middleware; errors flow to a single centralized handler producing a consistent envelope.
- **Token rotation:** the latest refresh token is stored per user; presenting a stale/revoked token is rejected. Logout nulls the stored token.
- **Audit trail:** `createdById` / `updatedById` are stamped from the authenticated user on every write.

<img width="1468" height="881" alt="Screenshot 2026-06-27 at 12 47 03 AM" src="https://github.com/user-attachments/assets/f8df4171-f81c-4690-8bf5-e9b287c738ed" />
<img width="1470" height="882" alt="Screenshot 2026-06-27 at 12 45 50 AM" src="https://github.com/user-attachments/assets/66ff62c4-4570-4a86-8ec5-9ab7bc16449b" />
<img width="1469" height="883" alt="Screenshot 2026-06-27 at 12 46 18 AM" src="https://github.com/user-attachments/assets/4dfafefb-1773-4d40-be7c-5906833257e9" />


```
