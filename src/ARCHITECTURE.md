# FastCourt source layout (v3)

- `app/` — Next.js routes & API only
- `features/<domain>/{ui,lib,model,hooks,styles}` — product modules
- `shared/{ui,lib,model,hooks,styles}` — cross-cutting kernel

Domains: auth, billing, settings, library, designer, practice, game-plan,
film-room, opponent-scout, playbank, players, share, demo.
