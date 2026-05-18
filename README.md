# Analytics Dashboard

A unified dashboard that pulls data from 13+ platforms (Shopify, Klaviyo, Google Analytics, Google Ads, Meta Ads, Microsoft Teams, Slack, Outlook, Power BI, Google Merchant Center, Trustpilot, Freshcaller, Search Console) using Claude Sonnet for intelligent data extraction and KPI synthesis.

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### Setup

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Start services (PostgreSQL, Redis):**
```bash
npm run docker:up
```

3. **Start development:**
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Production

Build and run with Docker:
```bash
npm run build
docker compose up -d --build
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── integrations/     # Platform modules (shopify/, klaviyo/, etc.)
│   │   ├── services/         # Database, Redis, auth
│   │   ├── api/              # Express routes
│   │   └── index.ts          # Entry point
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # Dashboard, Integrations, Settings
│   │   ├── components/       # Layout, shared components
│   │   └── styles/           # CSS
│   └── Dockerfile
│
├── docker-compose.yml        # PostgreSQL, Redis, app containers
├── package.json              # Workspace root
└── README.md
```

## Supported Integrations

| Platform | Category | Status |
|----------|----------|--------|
| Shopify | E-commerce | ✅ Implemented |
| Klaviyo | Marketing | ✅ Implemented |
| Google Analytics | Analytics | ✅ Implemented |
| Google Ads | Advertising | ✅ Implemented |
| Meta Ads | Advertising | ✅ Implemented |
| Google Merchant Center | E-commerce | 🔄 Coming soon |
| Search Console | SEO | 🔄 Coming soon |
| Trustpilot | Reviews | 🔄 Coming soon |
| Freshcaller | Support | 🔄 Coming soon |
| Microsoft Teams | Communication | 🔄 Coming soon |
| Slack | Communication | 🔄 Coming soon |
| Outlook | Communication | 🔄 Coming soon |
| Power BI | BI | 🔄 Coming soon |

## API Endpoints

- `GET /api/integrations` - List all integrations
- `POST /api/integrations/:platform/connect` - Connect a platform
- `POST /api/integrations/:platform/sync` - Trigger sync
- `GET /api/dashboard/kpis` - Get all KPIs
- `GET /api/dashboard/summary` - Dashboard summary

## Deployment

Deploy to any Docker host:
```bash
docker build -t analytics-dashboard .
docker run -p 3001:3001 -p 5173:5173 analytics-dashboard
```

Or use the included docker-compose.yml for orchestration.