# Deploy FastCourt v3 on Coolify

## Recommended setup

- **Build Pack:** Dockerfile  
- **Dockerfile:** `./Dockerfile`  
- **Port:** `3000` (Coolify maps it; `server.js` also reads `PORT`)  
- **Start command:** leave empty (image `CMD` is `node server.js`)  
- **Health check path:** `/api/health`

Practice Live WebSocket uses the **same port**: `wss://YOUR_DOMAIN/practice-live`.

Do **not** set `NEXT_PUBLIC_LIVE_WS_MODE=port` on Coolify.

## Steps in Coolify UI

1. New Resource → **Git Repository** (or upload / private repo).
2. Choose this project (`fastcourt_ver.3`).
3. Build Pack → **Dockerfile**.
4. Set domain + HTTPS (Coolify proxy / Traefik / Caddy).
5. Add environment variables (below).
6. Enable **“Is it a Dockerfile?”** build-time args if your Coolify version exposes Build Arguments — mirror every `NEXT_PUBLIC_*` you need.
7. Deploy.

## Environment variables

### Build-time (`NEXT_PUBLIC_*` — must exist during `npm run build`)

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_APP_BUILD` | no | e.g. `coolify-v1` |
| `NEXT_PUBLIC_SITE_URL` | recommended | `https://your-domain` |
| `NEXT_PUBLIC_SUPABASE_URL` | optional | Cloud auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional | Cloud auth |
| `NEXT_PUBLIC_ADMIN_EMAIL` | optional | |
| `NEXT_PUBLIC_ADMIN_EMAILS` | optional | |

Without Supabase, app runs local/demo mode. Live still works via WebSocket.

### Runtime (server-only)

| Variable | Required | Notes |
|----------|----------|--------|
| `PORT` | usually auto | Coolify sets this |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | |
| `OPENAI_API_KEY` | optional | Film analyze |
| `STRIPE_SECRET_KEY` | optional | |
| `STRIPE_WEBHOOK_SECRET` | optional | |

If you change any `NEXT_PUBLIC_*`, **Redeploy / Rebuild** (not only restart).

## Nixpacks alternative

If you prefer Nixpacks instead of Dockerfile:

- Install command: `npm ci`
- Build command: `npm run build`
- Start command: `node server.js`
- Port: `3000`

## Local Docker test (optional)

```bash
cd C:\fastcourt_ver.3
docker compose build
docker compose up
```

Open http://localhost:3000

## After deploy checklist

- [ ] `https://YOUR_DOMAIN/api/health` → `{ ok: true }`
- [ ] App loads / login or local mode works
- [ ] Practice → Share plan → Start live → second device follows via `wss://YOUR_DOMAIN/practice-live`
