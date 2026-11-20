# Deploy FastCourt v3 on Railway

## 1. Push the repo

Railway deploys from GitHub (or Railway CLI). Push `C:\fastcourt_ver.3` to a GitHub repo first if needed.

## 2. Create the service

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select this repo
3. Railway reads `railway.toml` (`npm ci && npm run build`, start `node server.js`)

## 3. Environment variables

Set these in Railway → Variables **before** the first successful build (anything `NEXT_PUBLIC_*` is baked in at build time):

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_APP_BUILD` | no | e.g. `railway-v1` |
| `NEXT_PUBLIC_LIVE_WS_MODE` | no | **Do not set to `port`** on Railway |
| `NEXT_PUBLIC_SUPABASE_URL` | optional | Cloud auth/sync |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional | Cloud auth/sync |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Server admin/webhooks |
| `OPENAI_API_KEY` | optional | Film analyze |

Without Supabase, the app runs in local/demo mode. Practice Live still works over `wss://YOUR_DOMAIN/practice-live`.

## 4. Public URL

Generate a Railway domain (Settings → Networking → Generate Domain).

Practice Live path: `wss://YOUR_DOMAIN/practice-live` (attached in `server.js`).

## 5. CLI alternative

```bash
npm i -g @railway/cli
railway login
cd C:\fastcourt_ver.3
railway init
railway up
railway variables set NEXT_PUBLIC_APP_BUILD=railway-v1
```

## 6. Health check

`GET /api/health` should return `{ ok: true, ... }`.
