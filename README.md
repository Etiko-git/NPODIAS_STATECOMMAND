# NPODIAS — Lagos State Police Command Center (A + B)

This repo implements:
- **A. UI completeness** (dashboard KPIs, roster, incident alerts, map, operations, reports)
- **B. National Core integration layer** (typed API adapter + mock backend + loading/error + toasts)

## Quick start
```bash
npm install
cp .env.example .env
npm run dev
```

## National Core integration
- Configure in `.env`:
  - `VITE_NPODIAS_CORE_BASE_URL`
  - `VITE_NPODIAS_CORE_TOKEN`

Use `mock://local` for local in-memory integration (default).

## Key folders
- `src/api/` — typed client + services + mock backend (swap to real NPODIAS endpoints)
- `src/state/` — Zustand store + guards + RBAC
- `src/pages/` — dashboard and operational pages
- `src/components/` — command-center UI components
