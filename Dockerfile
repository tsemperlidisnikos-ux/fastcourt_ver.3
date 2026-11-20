# FastCourt v3 — Coolify / Docker
# Practice Live WS: same PORT at /practice-live

FROM node:22-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Skip desktop/browser tooling downloads during image build
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    npm_config_fund=false \
    npm_config_audit=false

COPY package.json package-lock.json ./
# postinstall needs these scripts; defer it until the builder has full source
RUN npm ci --ignore-scripts

FROM node:22-bookworm-slim AS builder
WORKDIR /app

ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Coolify: pass these as Build Arguments / build-time env
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_BUILD=coolify
ARG NEXT_PUBLIC_ADMIN_EMAIL=admin@fastcourt.eu
ARG NEXT_PUBLIC_MASTER_ADMIN_EMAIL=admin@fastcourt.eu
ARG NEXT_PUBLIC_ADMIN_EMAILS=admin@fastcourt.eu
ARG NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD=FastCourt-Admin-2026!
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_LIVE_WS_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_APP_BUILD=$NEXT_PUBLIC_APP_BUILD \
    NEXT_PUBLIC_ADMIN_EMAIL=$NEXT_PUBLIC_ADMIN_EMAIL \
    NEXT_PUBLIC_MASTER_ADMIN_EMAIL=$NEXT_PUBLIC_MASTER_ADMIN_EMAIL \
    NEXT_PUBLIC_ADMIN_EMAILS=$NEXT_PUBLIC_ADMIN_EMAILS \
    NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD=$NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_LIVE_WS_URL=$NEXT_PUBLIC_LIVE_WS_URL

RUN npm run postinstall && npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/next.config.ts ./next.config.ts

# Drop heavy desktop/test tooling from the runtime image
RUN npm prune --omit=dev \
  && rm -rf /root/.npm /tmp/*

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
