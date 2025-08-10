# Admin Backend

This service exposes admin endpoints mirroring the original maintenance scripts in `config/` without importing that directory directly.

## Auth
All routes under `/api/admin/*` are protected by an optional API key header.

Header: `x-admin-key: <ADMIN_API_KEY>`
Environment: set `ADMIN_API_KEY` in `.env` (if omitted, routes are open and a warning logs once).

## Environment Variables
Primary lookup order for environment files:
1. Project root `.env`
2. `admin-backend/.env`

```
MONGO_URI=mongodb://localhost:27017/LibreChat
PORT=3001
ADMIN_API_KEY=change_me_strong   # Used for x-admin-key header auth
DOMAIN_CLIENT=https://your-client.example  # Used to build invite links
```

## Endpoints (summary)
Method | Path | Description
------ | ---- | -----------
GET | /api/admin/health | Health check
GET | /api/admin/users | List users
POST | /api/admin/users | Create user (email, password?, name, username, emailVerified)
DELETE | /api/admin/users/:id | Delete user + simple related docs
POST | /api/admin/users/:id/ban | Ban user (durationMinutes)
POST | /api/admin/users/:id/unban | Unban user
POST | /api/admin/users/:id/reset-password | Reset password (newPassword)
POST | /api/admin/users/reset-terms | Reset termsAccepted=false for all
GET | /api/admin/balances | List balances
POST | /api/admin/balances/:id/add | Increment balance (amount != 0)
POST | /api/admin/balances/:id/set | Set balance absolute (amount >= 0)
GET | /api/admin/user-stats | Basic stats placeholder (conv/message=0)
POST | /api/admin/banner | Create/update singleton banner
DELETE | /api/admin/banner | Remove banner
POST | /api/admin/invite | Create (or reuse) invite token

## Run
```bash
node index.js
```

## Minimal Smoke Test (PowerShell)
```powershell
$env:ADMIN_API_KEY='testkey'; node index.js &
Start-Sleep -Seconds 2
Invoke-RestMethod -Headers @{"x-admin-key"='testkey'} http://localhost:3001/api/admin/health
```

## Notes
- Password hashing via pre-save hook (`bcryptjs`).
- Transaction log stored when balances change.
- Stats endpoint is a placeholder; extend with conversation/message models if needed.
- For production protect behind network + API key (and ideally JWT/OIDC later).
