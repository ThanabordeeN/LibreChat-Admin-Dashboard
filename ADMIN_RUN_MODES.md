## Admin Modules Run Modes Guide

Clear, copy-paste friendly instructions (Windows PowerShell) for running the Admin Backend and Admin Dashboard in different scenarios.

---
### 0. Prerequisites
Install dependencies (only once per package when doing pure local dev):
```
cd admin-backend ; npm install
cd ../admin-dashboard ; npm install
```
Ensure MongoDB is available (local `mongod`, Docker `mongodb` container, or remote URI).

Minimal required env vars (root `.env` preferred):
```
MONGO_URI=mongodb://localhost:27017/LibreChat
ADMIN_API_KEY=dev-key            # optional but recommended
JWT_SECRET=dev-secret            # for prototype login
ADMIN_BACKEND_PORT=3001
VITE_ADMIN_API_BASE=http://localhost:3001/api
VITE_ADMIN_API_KEY=dev-key       # matches ADMIN_API_KEY if using header auth
```

---
### 1. Backend Only (Node local)
Run in one terminal (PowerShell):
```
cd admin-backend
npm start
```
If you didn't define a root `.env`, set quick vars inline:
```
$env:MONGO_URI='mongodb://localhost:27017/LibreChat'
$env:ADMIN_API_KEY='dev-key'
$env:JWT_SECRET='dev-secret'
npm start
```
Then test:
```
Invoke-RestMethod -Headers @{ 'x-admin-key'='dev-key' } http://localhost:3001/api/admin/health
```

---
### 2. Dashboard Only (pointing to existing backend)
Assumes backend reachable at `http://localhost:3001/api` or remote.
```
cd admin-dashboard
"VITE_ADMIN_API_BASE=http://localhost:3001/api`nVITE_ADMIN_API_KEY=dev-key" | Out-File -Encoding utf8 .env
npm run dev
```
Open http://localhost:8080

To target remote backend:
```
"VITE_ADMIN_API_BASE=https://your-remote-host/api`nVITE_ADMIN_API_KEY=prod-key" | Out-File -Encoding utf8 .env
npm run dev
```

---
### 3. Both (Local Node processes)
Terminal A:
```
cd admin-backend
npm start
```
Terminal B:
```
cd admin-dashboard
npm run dev
```
Visit http://localhost:8080 (frontend) – backend on 3001.

---
### 4. Docker Compose (Admin services only)
Use the supplied `docker-compose.override.yml` plus a minimal root `.env`.

Start required services:
```
docker compose up -d admin-backend admin-dashboard mongodb
```
Or start everything (base LibreChat stack too):
```
docker compose up -d
```
Access:
- Admin Dashboard: http://localhost:3000
- Admin Backend API: http://localhost:3001/api

Rebuild after changes:
```
docker compose build admin-backend admin-dashboard
docker compose up -d
```

Logs:
```
docker compose logs -f admin-backend
docker compose logs -f admin-dashboard
```

Stop & remove containers:
```
docker compose down
```

---
### 5. Backend in Docker, Dashboard Local (fast UI iteration)
Run backend container + local Vite dev server (hot reload):
```
docker compose up -d admin-backend mongodb
cd admin-dashboard
"VITE_ADMIN_API_BASE=http://localhost:3001/api`nVITE_ADMIN_API_KEY=dev-key" | Out-File -Encoding utf8 .env
npm run dev
```

---
### 6. Production-Style Local Build (no Docker)
```
cd admin-dashboard
npm run build
npm run preview   # serves dist
```
Adjust `VITE_ADMIN_API_BASE` before running build if needed.

---
### 7. Environment Override Cheatsheet
| Layer | Where | Notes |
|-------|-------|-------|
| Root `.env` | project root | Preferred single source; used by compose via `env_file` |
| admin-backend/.env | optional | Only if you need different Mongo or secrets for manual runs |
| admin-dashboard/.env | optional | Only for standalone dev; not needed in compose |
| Runtime inline vars | PowerShell `$env:NAME=...` | Ephemeral; overrides file for that session |

Resolution order (backend): root `.env` → `admin-backend/.env` → process env (inline exported). Frontend is compile time for `VITE_*`.

---
### 8. Common Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| 404 from dashboard API calls | Wrong `VITE_ADMIN_API_BASE` | Set to `http://localhost:3001/api` or container hostname `http://admin-backend:3001/api` |
| CORS error in browser console | Backend not running or port mismatch | Ensure backend listening & matches base URL |
| `EADDRINUSE` on backend start | Port 3001 used | Set `ADMIN_BACKEND_PORT=3002` (and update base URL) |
| JWT login fails | User has no password hash | Create user with password via API first |
| API key 401 | Missing/incorrect header | Align `ADMIN_API_KEY` and `VITE_ADMIN_API_KEY` / request header |

---
### 9. Smoke Test Script (PowerShell)
```
Invoke-RestMethod http://localhost:3001/api/admin/health
Invoke-RestMethod -Headers @{ 'x-admin-key'='dev-key' } http://localhost:3001/api/admin/health
```

---
### 10. Clean Rebuild Cycle (Compose)
```
docker compose down
docker compose build admin-backend admin-dashboard
docker compose up -d admin-backend admin-dashboard mongodb
docker compose logs -f admin-backend
```

---
### 11. Updating Dependencies (Local)
Backend:
```
cd admin-backend
npm install <package>@latest
```
Dashboard:
```
cd admin-dashboard
npm install <package>@latest
```
Then rebuild / restart per mode.

---
### 12. Next Steps
- Add tests for admin backend endpoints.
- Add pagination & filtering to `/api/admin/users`.
- Implement email → id convenience ban in dashboard.

---
This guide is intentionally concise—refer to individual READMEs for deeper details.
