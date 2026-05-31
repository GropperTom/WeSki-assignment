# WeSki Hotel Search

A full-stack ski hotel search app. The backend streams results from external providers over **SSE** (Server-Sent Events); the frontend merges incremental results, caches recent searches, and keeps filters in the URL.

## Repository structure

```
WeSki-assignment/
├── package.json              # Root scripts (dev:frontend, dev:backend)
├── backend/
│   └── src/
│       ├── index.ts                    # Express app, CORS, /health
│       ├── routes/hotels.ts            # GET /hotels/search/stream (SSE)
│       ├── services/streamHotelSearch.ts # Fan-out to providers, write SSE events
│       ├── schemas/                    # Zod query + stream event schemas
│       ├── integrations/               # Provider registry and adapters
│       │   └── externalAPI/            # HotelsSimulator API client + parsing
│       └── cache/
│           └── externalAPIGroupCache.ts # In-memory provider response cache
└── frontend/
    └── src/
        ├── main.tsx                    # MUI theme, React Query, Router
        ├── App.tsx                     # Search UI shell
        ├── api/searchHotels.ts         # SSE client (fetch + stream reader)
        ├── hooks/
        │   ├── useHotelSearch.ts       # Search state, cache, abort
        │   └── useSearchFilters.ts     # Filters synced to URL (react-router)
        ├── components/                 # PageHeader, filters, hotel cards
        ├── schemas/                    # Zod (aligned with backend)
        ├── utils/
        │   ├── hotelSearchCache.ts     # Client-side search result cache
        │   └── mergeHotelResults.ts    # Merge hotels by provider
        ├── types/                      # SearchFilters, resort, date period
        └── data/resorts.ts             # Static resort list
```

**Data flow:** User submits filters → frontend validates with Zod → optional **client cache** hit → otherwise `GET /api/hotels/search/stream` (proxied to the backend) → backend calls each **provider** in parallel → provider may use **server cache** → hotels stream back as SSE `provider_result` events → frontend merges and displays cards.

## Tools and libraries

| Area | Technology | Role |
|------|------------|------|
| UI | [MUI](https://mui.com/) (`@mui/material`, Emotion) | Layout, typography, form controls |
| Dates | [MUI X Date Pickers](https://mui.com/x/react-date-pickers/) + [dayjs](https://day.js.org/) | Ski date range selection |
| Frontend | React 19, TypeScript, [Vite](https://vite.dev/) | SPA build and dev server |
| Routing | [React Router](https://reactrouter.com/) | URL query params for resort, guests, dates |
| Data fetching | Custom hook + `fetch` streams | SSE search (not REST polling) |
| App shell | [TanStack React Query](https://tanstack.com/query) | `QueryClientProvider` (ready for server state) |
| Streaming | **SSE** (Server-Sent Events) | Backend streams per-provider results; frontend parses `data:` lines |
| Dev proxy | Vite `server.proxy` | `/api` → `http://localhost:3001`; dedicated SSE rule avoids buffering |
| Validation | [Zod](https://zod.dev/) | Shared-style schemas on frontend and backend |
| Caching | In-memory `Map` (FE + BE) | 10-minute TTL; FE caches full search, BE caches external API groups |
| Backend | [Express](https://expressjs.com/) 5, `cors`, `tsx` | API server; `npm run dev` uses watch mode |
| External API | AWS HotelsSimulator | POST JSON search; grouped by `group_size` |

## Running the project

**Prerequisites:** Node.js 20+ and npm.

1. **Install dependencies** (once per package):

   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. **Start the backend** (port `3001` by default):

   ```bash
   npm run dev:backend
   ```

   Or from `backend/`: `npm run dev`

3. **Start the frontend** (Vite, typically `http://localhost:5173`):

   ```bash
   npm run dev:frontend
   ```

   Or from `frontend/`: `npm run dev`

4. Open the Vite URL in the browser. API calls go to `/api/...`, which Vite proxies to the backend.

**Optional:** Set `PORT` for the backend (default `3001`). The frontend proxy in `frontend/vite.config.ts` expects the backend on that port.

**Production build:**

```bash
npm run build --prefix backend && npm run start --prefix backend
npm run build --prefix frontend && npm run preview --prefix frontend
```

## API

- `GET /health` — health check
- `GET /hotels/search/stream?resort=&guests=&start=&end=` — SSE stream of `provider_result`, `provider_error`, and `done` events (see `backend/src/schemas/hotelSearchStreamSchema.ts`)
