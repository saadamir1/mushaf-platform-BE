# Mushaf Platform - Digital Quran Backend API

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)

A comprehensive, production-ready REST API for delivering digital Quran content with Urdu translations, tafseer, search capabilities, and user personalization features.

> **💡 Foundation App:** This backend includes complete authentication system with JWT tokens, refresh tokens, email verification, password reset, role-based access control, and admin APIs. It's designed to be easily adapted for other projects - just remove the Quran-specific modules and keep the auth foundation!

## 🔧 Foundation Features (Reusable)
- JWT Authentication with Access & Refresh Tokens
- User Registration & Login
- Email Verification with Token Expiry
- Password Reset via Email
- Role-Based Access Control (User/Admin)
- User Management APIs (CRUD)
- Profile Picture Upload (Cloudinary)
- Audit Logging
- Rate Limiting
- PostgreSQL + TypeORM Setup
- Swagger API Documentation

---

## 🎯 Project Purpose

**Mushaf Platform** is designed to make Quranic content digitally accessible with a focus on:

- **Accessibility**: Large text and simple navigation for elders
- **Education**: Urdu translations and tafseer for children and students
- **Research**: Structured indexing and search for scholars
- **Modern UX**: Fast, responsive API for web and mobile applications

The platform prioritizes accuracy, respect for Islamic content, and user-friendly access to the Holy Quran.

### **Target Audience:**
- Muslims seeking reliable digital Quran access
- Students learning Quran with translations
- Scholars researching Quranic verses
- Developers building Islamic applications

### **Key Features:**
- ✅ Complete Quran content (114 Surahs, 6,236+ verses)
- ✅ Urdu translations and tafseer integration
- ✅ Multiple navigation modes (Surah, Juz, Page)
- ✅ Full-text search (Arabic, Urdu, Tafseer)
- ✅ User bookmarks and reading progress tracking
- ✅ JWT authentication with role-based access
- ✅ RESTful API with Swagger documentation
- ✅ Ready for scanned page integration (950+ pages via CDN)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | NestJS (TypeScript) |
| **Database** | PostgreSQL 17+ with TypeORM |
| **API** | REST with OpenAPI/Swagger |
| **Authentication** | JWT (Access + Refresh Tokens) |
| **File Storage** | Cloudinary CDN (ready) |
| **Documentation** | Swagger UI (`/api/docs`) |
| **Development** | Hot reload, TypeScript strict mode |

---

## 🚀 Quick Start

### **Prerequisites:**
- Node.js 18+
- PostgreSQL 17+
- npm or yarn

### **1. Clone & Install**
```bash
git clone https://github.com/saadamir1/mushaf-platform-BE.git
cd mushaf-platform-BE
npm install
```

### **2. Database Setup**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database and user
CREATE USER mushaf_admin WITH PASSWORD 'secret';
CREATE DATABASE mushaf_platform_db OWNER mushaf_admin;
GRANT ALL PRIVILEGES ON DATABASE mushaf_platform_db TO mushaf_admin;

-- Exit
\q
```

### **3. Environment Configuration**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=mushaf_admin
DB_PASSWORD=secret
DB_NAME=mushaf_platform_db
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=development
```

### **4. Seed Sample Data**
```bash
# Import test data (3 surahs, 3 verses, 1 juz)
npm run seed
```

### **5. Start Development Server**
```bash
npm run start:dev

# Server runs on: http://localhost:3000
# API Base: http://localhost:3000/api/v1
# Swagger Docs: http://localhost:3000/api/docs
```

---

## 📚 API Documentation

### **Base URL:**
```
Development: http://localhost:3000/api/v1
```

### **Interactive Documentation:**
```
Swagger UI: http://localhost:3000/api/docs
```

### **Core Endpoints:**

#### **Surahs**
```http
GET    /quran/surahs              # List all surahs
GET    /quran/surahs/:number      # Get surah by number
GET    /quran/surahs/:number/verses  # Get surah with verses
```

#### **Verses**
```http
GET    /quran/verses              # List verses (paginated)
GET    /quran/verses/surah/:id    # Get verses by surah
GET    /quran/verses/page/:number # Get verses by page
GET    /quran/verses/juz/:number  # Get verses by juz
GET    /quran/verses/search?q=keyword  # Search verses
GET    /quran/verses/:id          # Get single verse
```

#### **Juz (Para)**
```http
GET    /quran/juz                 # List all juz (30 parts)
GET    /quran/juz/:number         # Get juz by number
```

#### **Pages**
```http
GET    /quran/pages               # List pages (paginated)
GET    /quran/pages/:number       # Get page by number
```

#### **Search**
```http
GET    /quran/search?q=keyword    # Search everywhere
GET    /quran/search/verses?q=keyword  # Search verses only
GET    /quran/search/surahs?q=keyword  # Search surahs only
```

#### **Bookmarks** (Protected - JWT Required)
```http
POST   /bookmarks                 # Create bookmark
GET    /bookmarks                 # Get user bookmarks
DELETE /bookmarks/:id             # Delete bookmark
PATCH  /bookmarks/:id/note        # Update bookmark note
POST   /bookmarks/progress        # Update reading progress
GET    /bookmarks/progress        # Get reading progress
```

#### **Authentication**
```http
POST   /auth/login                # Login
POST   /auth/register             # Register (admin only)
POST   /auth/refresh              # Refresh token
POST   /auth/forgot-password      # Request password reset
POST   /auth/reset-password       # Reset password
```

---

## 📊 Database Schema
```
┌─────────┐       ┌─────────┐       ┌──────────────┐
│ Surah   │───┬──>│ Verse   │       │ QuranPage    │
│ (114)   │   │   │ (6236)  │       │ (604)        │
└─────────┘   │   └─────────┘       └──────────────┘
              │
              │   ┌─────────┐       ┌──────────────┐
              │   │ Juz     │       │ Bookmark     │
              │   │ (30)    │       │ (user-based) │
              │   └─────────┘       └──────────────┘
              │
              └──>┌──────────────────┐
                  │ ReadingProgress  │
                  │ (user-based)     │
                  └──────────────────┘
```

### **Key Entities:**
- **Surah**: 114 chapters with metadata (name, verses count, revelation type)
- **Verse**: 6,236+ verses with Arabic text, Urdu translation, tafseer
- **QuranPage**: 604 pages with scanned image URLs (ready for CDN)
- **Juz**: 30 parts for structured navigation
- **Bookmark**: User-specific verse bookmarks with notes
- **ReadingProgress**: Track last read position per user

---

## 🗂️ Project Structure
```
mushaf-platform-BE/
├── src/
│   ├── auth/              # JWT authentication + DTOs
│   ├── users/             # User management
│   ├── quran/             # Main Quran module
│   │   ├── entities/      # Surah, Verse, Page, Juz entities
│   │   ├── surahs/        # Surah CRUD operations (cached)
│   │   ├── verses/        # Verse queries, search, filters
│   │   ├── juz/           # Juz navigation (cached)
│   │   ├── pages/         # Page management (cached)
│   │   └── search/        # Search service with sanitization
│   ├── bookmarks/         # User bookmarks & reading progress + DTOs
│   ├── cache/             # In-memory cache module
│   ├── upload/            # Cloudinary integration
│   ├── common/            # Guards, services, middleware
│   │   ├── decorators/    # Custom decorators
│   │   ├── entities/      # Shared entities
│   │   ├── filters/       # Exception handling
│   │   ├── guards/        # Authorization
│   │   ├── middleware/    # Logging
│   │   └── services/      # Shared services
│   ├── migrations/        # Database migrations (for production)
│   └── scripts/           # Seed and data import scripts
├── .env                   # Environment variables
├── CHANGELOG.md           # Recent improvements log
├── REDIS_SETUP.md         # Redis caching guide (optional)
├── package.json
└── README.md
```

---

## 🔧 Available Scripts
```bash
# Development
npm run start:dev          # Start development server with hot reload
npm run start:prod         # Start production server
npm run build              # Build for production

# Database
npm run seed               # Import sample data
npm run migration:generate # Generate migration from entity changes
npm run migration:run      # Run database migrations
npm run migration:revert   # Revert last migration

# Note: Keep synchronize:true during development
# Generate migrations only before production deployment

# Testing
npm test                   # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage
```

---

## 🧪 Example API Calls

### **Get All Surahs:**
```bash
curl http://localhost:3000/api/v1/quran/surahs
```

**Response:**
```json
[
  {
    "id": 1,
    "surahNumber": 1,
    "nameArabic": "الفاتحة",
    "nameEnglish": "Al-Fatihah",
    "nameUrdu": "فاتحہ",
    "versesCount": 7,
    "revelationType": "Meccan",
    "descriptionUrdu": "قرآن کی ابتدائی سورت",
    "createdAt": "2026-02-15T00:00:00.000Z"
  }
]
```

### **Search Verses:**
```bash
curl "http://localhost:3000/api/v1/quran/search/verses?q=رحم"
```

**Response:**
```json
{
  "query": "رحم",
  "results": [
    {
      "id": 1,
      "verseNumber": 1,
      "textArabic": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "textUrdu": "شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے",
      "surah": {
        "surahNumber": 1,
        "nameEnglish": "Al-Fatihah"
      }
    }
  ],
  "count": 1
}
```

### **Create Bookmark (Protected):**
```bash
curl -X POST http://localhost:3000/api/v1/bookmarks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"verseId": 1, "note": "Important verse"}'
```

---

## 🔐 Authentication

### **Bootstrap Admin (First Time):**
```bash
curl -X POST http://localhost:3000/api/v1/auth/bootstrap-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mushaf.com",
    "password": "Admin@123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### **Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mushaf.com",
    "password": "Admin@123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Use `access_token` in Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 📈 Roadmap

### **Phase 1: Backend Foundation** ✅ (COMPLETED)
- [x] Database schema and entities with unique constraints
- [x] Core CRUD APIs (Surahs, Verses, Juz, Pages)
- [x] Search functionality with input sanitization
- [x] User authentication with JWT (environment-based secrets)
- [x] Bookmarks and reading progress with percentage calculation
- [x] Request validation with DTOs
- [x] In-memory caching for static data
- [x] Pagination support
- [x] API documentation (Swagger)

### **Phase 2: Data Integration** ⏳ (IN PROGRESS)
- [ ] Import full Quran data (6,236 verses)
- [ ] Upload scanned pages to Cloudinary (950+ pages)
- [ ] Integrate complete Urdu translations
- [ ] Add comprehensive tafseer
- [ ] Map verses to pages accurately

### **Phase 3: Frontend Development** ⏳ (NEXT)
- [ ] React/Next.js web interface
- [ ] Elder-friendly UI (large text, simple navigation)
- [ ] Child-friendly learning features
- [ ] Responsive design for mobile/tablet
- [ ] Search interface with filters
- [ ] Bookmarks management UI
- [ ] Reading progress visualization

### **Phase 4: Advanced Features** 📅 (PLANNED)
- [ ] Audio recitation playback (verse-by-verse)
- [ ] Advanced search filters (Meccan/Medinan, Juz range)
- [ ] Multiple translation support (English, French)
- [ ] Verse highlighting on scanned pages
- [ ] Analytics dashboard (popular verses, search queries)
- [ ] Mobile apps (iOS/Android)

### **Phase 5: Production Launch** 📅 (FUTURE)
- [ ] Comprehensive testing (unit + E2E)
- [ ] Performance optimization
- [ ] Database migrations for production
- [ ] CI/CD pipeline setup
- [ ] Cloud deployment (AWS/Vercel/Railway)
- [ ] Public release

---

## 🎯 Development Guidelines

- Follow NestJS best practices and clean architecture
- Maintain TypeScript strict mode for type safety
- Add comprehensive Swagger documentation
- Ensure Quranic content accuracy and integrity
- Test thoroughly before deployment
- Handle Arabic/Urdu text encoding properly (UTF-8)
- Implement proper error handling and validation
- Use pagination for all list endpoints
- Optimize database queries with proper indexing

---

## 📄 License & Usage

**License:** MIT License for codebase  
**Content:** Quranic content is sacred and protected

### **Usage Guidelines:**

**Allowed:**
- ✅ Personal, educational, and non-commercial use
- ✅ Integration into Islamic apps and websites
- ✅ Modification of code (not Quranic content)
- ✅ Learning and studying the implementation

**Not Allowed:**
- ❌ Modifying or misrepresenting Quranic text
- ❌ Removing attribution from Quranic content
- ❌ Commercial use without proper licensing
- ❌ Using translations without crediting original authors

### **Content Integrity:**
All Quranic verses, translations, and tafseer are verified for accuracy. Any errors should be reported immediately via GitHub issues.

**Disclaimer:** This API provides Quranic content as-is. Users should consult qualified Islamic scholars for authoritative religious guidance.

---

## 👤 Developer

**Saad Amir** - Backend Engineer

- 🔗 GitHub: [@saadamir1](https://github.com/saadamir1)
- 💼 LinkedIn: [linkedin.com/in/saadamir](https://linkedin.com/in/saadamir)
- 📧 Email: Saadamir070@gmail.com
- 📍 Location: Islamabad, Pakistan

### **Tech Stack Expertise:**
- Backend: NestJS, Node.js, TypeScript, REST/GraphQL APIs
- Database: PostgreSQL, MongoDB, TypeORM, Mongoose
- Architecture: Multi-tenant SaaS, Microservices, Event-Driven Systems
- DevOps: Docker, Kubernetes, CI/CD, AWS/Azure

**Portfolio:** This project demonstrates production-grade API development with enterprise patterns, comprehensive documentation, and scalable architecture suitable for serving millions of users.

---

## 🙏 Acknowledgments

**Technical Stack:**
- NestJS team for the excellent framework
- TypeORM for robust database integration
- PostgreSQL community for reliable database solutions
- Open source contributors worldwide

**Content & Resources:**
- Islamic scholars who verified translations and tafseer accuracy
- Quran API projects that inspired this work
- Muslim community for feedback and suggestions

**Development Support:**
- Cloudinary for CDN infrastructure
- Swagger/OpenAPI for API documentation standards

---

**Built to serve the Muslim community with accurate, accessible Quranic content.**

*"Read in the name of your Lord who created" - Quran 96:1*

---

**⭐ Star this repo if you find it helpful** | **🐛 Report Issues** | **🤝 Contributions Welcome**