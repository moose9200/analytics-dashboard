# Analytics Dashboard Architecture

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         FRONTEND                              │
│              Vite + React + Recharts + CSS                   │
│                 (Port 5173)                                   │
└──────────────────────────────────────────────────────────────┘
                              │ REST API
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND (Modular Monolith)                 │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   api/     │  │ services/  │  │integrations│            │
│  │ /dashboard │  │   db/      │  │  shopify/  │            │
│  │ /integrate │  │   redis/   │  │  klaviyo/  │            │
│  │ /auth      │  │   cache/   │  │  ga/       │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                         (Port 3001)                          │
└──────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
      ┌─────────┐         ┌─────────┐        ┌─────────┐
      │PostgreSQL│         │  Redis  │        │ClaudeCode│
      │  :5432  │         │  :6379  │        │   CLI   │
      └─────────┘         └─────────┘        └─────────┘
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite + React 18 + Recharts |
| Backend | Express.js (Modular Monolith) |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Auth | JWT + bcrypt |
| API | REST + polling |
| Deployment | Docker Compose |

## Integration Pattern

Each platform has a module:

```
integrations/[platform]/
├── client.ts     # API client
├── sync.ts       # Sync logic (webhook + cron)
├── queries.ts    # Predefined report queries
└── schema.ts     # Data models
```

## Data Sync Strategy

- **Real-time**: Webhooks where supported
- **Historical**: Cron jobs (hourly/daily)
- **On-demand**: Manual sync button

## Deployment

Docker Compose orchestrates all services:
- PostgreSQL (data)
- Redis (caching)
- Backend (API)
- Frontend (UI)

Works locally, deployable to any Docker host.