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
│       └── cache/                      # Per-provider backend caching (see Caching)
│           ├── createMemoryCache.ts
│           ├── withQueryProviderCache.ts
│           └── providers/
│               ├── externalAPI/groupCache.ts
│               └── queryProviderCache.ts
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

## Caching

Caching is split into a **frontend session cache** (whole search) and **backend provider caches** (per upstream source). Both use in-memory `Map` stores with a **10-minute TTL** and LRU eviction when full.

### Frontend (`frontend/src/utils/hotelSearchCache.ts`)

After a successful stream, `useHotelSearch` stores the merged result for the current browser session:

| | |
|---|---|
| **Key** | `resort:start:end:guests` |
| **Value** | All hotels (with `provider` tag) + any `provider_error` events |
| **Max entries** | 20 |

On the next search with the same filters, the hook skips the network call and restores hotels and errors immediately. This cache is independent of which providers ran on the backend.

### Backend — shared store (`backend/src/cache/createMemoryCache.ts`)

Each provider cache is built on `createMemoryCache`, which handles TTL expiry, LRU eviction, and `[cache] BE hit/miss/stored` logging. Provider-specific modules only define **keys** and **when** to read/write.

Providers are registered in `integrations/index.ts` via `registerHotelSearchProvider()`, which picks a strategy from the provider’s search shape:

| Provider shape | Strategy | Module |
|----------------|----------|--------|
| One upstream call per user query | **Query cache** — wrap with `withQueryProviderCache` | `cache/providers/queryProviderCache.ts` |
| Multiple upstream calls per user query | **Custom cache** inside the provider’s `search` | e.g. `cache/providers/externalAPI/groupCache.ts` |

### Backend — query cache (default for new providers)

For providers that issue a single request per search, `withQueryProviderCache` wraps `search()`:

| | |
|---|---|
| **Key** | `query:resort:start:end:guests` (scoped by `provider.name`) |
| **Store** | One `createMemoryCache` instance per provider name |
| **Max entries** | 100 per provider |

On a hit, cached hotels are returned and streamed once via `onResult` with `fromCache: true`. On a miss, the real `search` runs and the full result is stored when the request is not aborted.

### Backend — externalAPI group cache

`externalAPI` is **not** wrapped with `withQueryProviderCache`. It fans out to HotelsSimulator once per distinct **group size** (derived from `guests`), so caching is inside `integrations/externalAPI/search.ts`:

| | |
|---|---|
| **Key** | `group:resort:start:end:groupSize` |
| **Value** | Hotels matching that `group_size` after parsing |
| **Max entries** | 200 |

Each parallel group-size request checks the group cache before calling the simulator. Partial cache hits still avoid redundant upstream calls for sizes already fetched. Stream logs show `cache=hit` per chunk when `fromCache` is set on `onResult`.

### Adding a provider

1. Implement `HotelSearchProvider` under `integrations/<name>/`.
2. Register it in `hotelSearchProviders` through `registerHotelSearchProvider()`.
3. Choose caching:
   - **Single request per query** — do nothing extra; the default wrapper applies query cache.
   - **Multiple requests or unusual keys** — skip the wrapper for that name in `registerHotelSearchProvider`, add a module under `cache/providers/<name>/`, and call it from `search()` (same pattern as `externalAPI`).

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
| Caching | In-memory `Map` (FE + BE) | See [Caching](#caching); FE = full search, BE = per-provider query or group cache |
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
