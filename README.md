# NestJS Backend Foundation

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)

A production-ready NestJS backend foundation with complete authentication system, user management, and role-based access control. Perfect starting point for any web or mobile application.

---

## 🎯 Features

- ✅ **JWT Authentication** - Access & Refresh tokens
- ✅ **User Registration & Login** - Secure with password hashing
- ✅ **Email Verification** - Token-based email verification
- ✅ **Password Reset** - Forgot password via email
- ✅ **Role-Based Access Control** - User & Admin roles
- ✅ **User Management APIs** - Full CRUD operations
- ✅ **Profile Picture Upload** - Cloudinary integration
- ✅ **Audit Logging** - Track user actions
- ✅ **Rate Limiting** - Prevent abuse
- ✅ **API Documentation** - Swagger/OpenAPI

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | NestJS (TypeScript) |
| **Database** | PostgreSQL with TypeORM |
| **API** | REST with OpenAPI/Swagger |
| **Authentication** | JWT (Access + Refresh Tokens) |
| **File Storage** | Cloudinary CDN |
| **Validation** | class-validator |
| **Rate Limiting** | @nestjs/throttler |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 17+
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/saadamir1/mushaf-platform-BE.git
cd mushaf-platform-BE
npm install
```

### 2. Database Setup
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE your_app_db;

-- Exit
\q
```

### 3. Environment Configuration
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=your_app_db

JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Email (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Start Server
```bash
npm run start:dev

# Server: http://localhost:3000
# API Docs: http://localhost:3000/api/docs
```

---

## 📚 API Endpoints

### Authentication
```http
POST /auth/register         # Register new user
POST /auth/login           # Login
POST /auth/refresh         # Refresh token
POST /auth/forgot-password # Request password reset
POST /auth/reset-password  # Reset password
GET  /auth/verify-email   # Verify email
POST /auth/resend-verification  # Resend verification email
```

### Users (Protected)
```http
GET    /users              # Get all users (admin only)
GET    /users/profile      # Get current user profile
PATCH  /users/profile      # Update profile
DELETE /users/account      # Delete own account
PATCH  /users/change-password  # Change password
POST   /users/upload-avatar  # Upload profile picture
GET    /users/:id          # Get user by ID (admin)
PATCH  /users/:id          # Update user (admin)
DELETE /users/:id          # Delete user (admin)
```

---

## 🔐 Authentication Flow

### 1. Bootstrap Admin (First Time)
```bash
curl -X POST http://localhost:3000/api/v1/auth/bootstrap-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123"
  }'
```

### 3. Use Token
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 🗂️ Project Structure

```
src/
├── auth/                   # JWT authentication
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── dto/
├── users/                  # User management
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── entities/
├── upload/                 # File uploads
├── cache/                  # Caching
├── common/                 # Shared
│   ├── decorators/        # Custom decorators
│   ├── guards/            # Auth guards
│   ├── services/          # Shared services
│   └── middleware/        # Logging
└── main.ts
```

---

## 🔧 Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run build              # Build for production

# Database
npm run migration:generate # Generate migration
npm run migration:run     # Run migrations

# Testing
npm test                   # Run tests
```

---

## 📝 User Roles

| Role | Description |
|------|-------------|
| `user` | Regular user - can manage own profile |
| `admin` | Admin - full access to all endpoints |

---

## 🌍 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | Database host | Yes |
| `DB_PORT` | Database port | Yes |
| `DB_USERNAME` | Database username | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `DB_NAME` | Database name | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes |
| `EMAIL_USER` | Gmail for sending emails | No |
| `EMAIL_PASS` | Gmail app password | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No |
| `CLOUDINARY_API_KEY` | Cloudinary API key | No |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | No |

---

## 🎨 Customization

### Add New Modules
```bash
nest g module new-module
nest g controller new-module
nest g service new-module
```

### Update CORS
Edit `main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:3001', 'https://yourdomain.com'],
  credentials: true,
});
```

---

## 📄 License

MIT License

---

## 👤 Developer

**Saad Amir** - [GitHub](https://github.com/saadamir1)

---

*Forked from Mushaf Platform - Remove Quran modules for clean foundation*
