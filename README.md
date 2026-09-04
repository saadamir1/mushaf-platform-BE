# Mushaf Platform - Backend API

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)

NestJS + TypeORM + PostgreSQL API for **Quran Aziz** scanned pages, navigation indexes, topics, bookmarks, and auth.

> Session notes: [`../CHANGELOG-2026-09-04.md`](../CHANGELOG-2026-09-04.md) · handover: [`../HANDOVER.md`](../HANDOVER.md)

## What’s new (2026-09-04)

- **Surah / page / Juz mapping** for this edition (content pages **37–1021**)
- Method: visual anchors + verse-weighted fill (`src/quran/mapping/`)
- **Auto-remap** after mushaf page upload (`POST /upload/mushaf-page`)
- Manual rebuild: `POST /quran/pages/remap` (admin) or `npm run map:finalize`
- Hotspots + Insights modules
- Pages routes: `surah` / `juz` / `map` registered before `:number`
- Embedded Postgres helper: `npm run db:start` (data on D: `.data/pgdata`)
- Seed: `npm run db:seed` → pages, surahs, topics, hotspots, admin user
- Auth: consistent “Invalid email or password”

## Quick Start

```bash
git clone https://github.com/saadamir1/mushaf-platform-BE.git
cd mushaf-platform-BE
npm install

# Terminal A — Postgres (embedded, keep open)
npm run db:start

# Seed once
npm run db:seed

# Terminal B — API
npm run start:dev
```

- API: http://localhost:3000/api/v1  
- Swagger: http://localhost:3000/api/docs  
- Admin after seed: `admin@mushaf.com` / `Admin@123`

Copy `.env.example` → `.env` if needed (DB `dev`/`secret`, JWT secrets).

## Git (personal account only)

Repo: **github.com/saadamir1/mushaf-platform-BE**  
Author: `Saad Amir` / `saadamir070@gmail.com` — **not** office Innovo identity.

## Mapping commands

| Command | Purpose |
|---------|---------|
| `npm run map:finalize` | Rebuild FE JSON map from anchors + weights |
| `npm run map:import -- file.csv` | Apply CSV `surahNumber,startPageNumber` |
| `npm run db:seed` | Sync FE data → Postgres |
| `POST /upload/mushaf-page` | Upload image + auto remap (admin JWT) |
| `POST /quran/pages/remap` | Remap only (admin JWT) |

Anchors (file page #): S1=37, S2=38, S3=115, S4=159, S40=800, S86=1000, S112=1020, S114=1021.

## Main modules

Auth, Users, Upload (Cloudinary), Quran (Surahs, Verses, Pages, Juz, Search, Topics), Bookmarks, Hotspots, Insights, Mapping.

## Foundation (reusable)

JWT access + refresh, register/login, email verify, password reset, RBAC, user CRUD, Cloudinary uploads, throttling, Swagger.

## Related

- Frontend: https://github.com/saadamir1/mushaf-platform-FE
