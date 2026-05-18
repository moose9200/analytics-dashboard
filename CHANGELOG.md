# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-19

### Added
- Analytics dashboard with 13+ platform integrations
- Backend: Express.js with modular monolith architecture
- Frontend: Vite + React + Recharts
- PostgreSQL database + Redis caching
- Integrations: Shopify, Klaviyo, Google Analytics, Google Ads, Meta Ads (implemented)
- API endpoints: dashboard KPIs, integrations, auth
- Docker Compose setup for local dev

### Changed
- Replaced better-sqlite3 with pg for PostgreSQL compatibility