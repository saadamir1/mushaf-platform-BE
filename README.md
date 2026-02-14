# Mushaf Platform Backend (NestJS + PostgreSQL)

A backend API for the Mushaf Platform, built with NestJS, TypeORM, and PostgreSQL. Supports Quran modules (Surahs, Verses, Pages, Juz) and Bookmarks.

---

## Table of Contents

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Setup](#setup)
4. [Environment Variables](#environment-variables)
5. [Database Configuration](#database-configuration)
6. [Development Workflow](#development-workflow)
7. [Migrations](#migrations)
8. [Testing](#testing)
9. [Folder Structure](#folder-structure)
10. [Contributing](#contributing)

---

## Features

* User management with authentication (JWT + refresh tokens)
* Quran modules:

  * Surahs
  * Verses
  * Pages
  * Juz
* Bookmark management
* Audit logs
* Rate limiting (ThrottlerModule)
* File uploads (Cloudinary or local)
* TypeORM-powered PostgreSQL DB
* Dev-friendly auto-sync & migrations support

---

## Prerequisites

* Node.js ≥ 20
* npm ≥ 9
* PostgreSQL ≥ 15
* Git

---

## Setup

```bash
# 1. Clone repo
git clone https://github.com/<your-username>/mushaf-platform-BE.git
cd mushaf-platform-BE

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your DB credentials and NODE_ENV
```

---

## Environment Variables

| Variable     | Description                                 | Example                           |
| ------------ | ------------------------------------------- | --------------------------------- |
| NODE_ENV     | Environment (`development` or `production`) | development                       |
| DATABASE_URL | Optional: Full DB URL for production        | postgres://user:pass@host:port/db |
| DB_HOST      | PostgreSQL host for dev                     | localhost                         |
| DB_PORT      | PostgreSQL port                             | 5432                              |
| DB_USERNAME  | PostgreSQL username                         | postgres                          |
| DB_PASSWORD  | PostgreSQL password                         | password                          |
| DB_NAME      | PostgreSQL database name                    | mushaf_platform_dev               |

---

## Database Configuration

* **Development**: `synchronize: true` (auto-sync tables for quick dev)
* **Production**: `synchronize: false` and migrations are required

> **Tip:** Once core modules are stable, generate a **baseline migration** to ensure team consistency.

---

## Development Workflow

1. Run the app in development:

```bash
npm run start:dev
```

2. Add new entities/modules (e.g., Quran modules, bookmarks).

3. Test changes locally using dev DB.

4. Commit + push changes:

```bash
git add .
git commit -m "feat: add Surah module"
git push origin main
```

5. Once stable, switch to **migration-first workflow**:

```ts
// app.module.ts
synchronize: false,
migrations: [join(process.cwd(), 'dist', 'migrations', '*.{ts,js}')],
migrationsRun: false,
```

---

## Migrations

* **Generate migration:**

```bash
npm run typeorm migration:generate src/migrations/DescriptiveName
```

* **Run migrations:**

```bash
npm run migration:run
```

* **Commit migration files** with entity changes to Git:

```bash
git add src/migrations/*
git commit -m "feat: add Surah entity and migration"
```

> New developers can run `npm run migration:run` to recreate the exact DB schema.

---

## Testing

* Testing setup (future): Jest + Supertest
* For now, test manually on dev DB (`synchronize: true`)

---

## Folder Structure

```
src/
 ├─ auth/          # Authentication module
 ├─ users/         # Users module
 ├─ quran/         # Quran entities: surahs, verses, pages, juz
 ├─ bookmarks/     # Bookmarks module
 ├─ upload/        # File upload module
 ├─ common/        # Middleware, entities, guards, etc.
 ├─ migrations/    # TypeORM migration files
 ├─ app.module.ts  # Main application module
 └─ main.ts        # Entry point
```

---

## Contributing

* Fork repo → Create feature branch → Commit → Push → Create PR
* Use migrations for schema changes
* Keep `main` branch deployable; create `dev` branch if working on risky or experimental features
