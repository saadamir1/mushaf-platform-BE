# Changelog

## [Unreleased] - 2026-02-20

### Security
- Fixed hardcoded JWT secrets - now using environment variables via ConfigService
- Added input sanitization to search queries to prevent SQL injection

### Added
- DTOs for authentication endpoints (login, refresh, forgot/reset password)
- DTOs for bookmark operations with validation
- Unique constraints on Surah.surahNumber and Verse(surahId, verseNumber)
- Reading progress percentage calculation (verseId / 6236 * 100)
- Pagination support for surah verses endpoint

### Changed
- Search now uses ILIKE (case-insensitive) instead of LIKE
- Auth module uses ConfigService for JWT configuration
- Controllers updated to use DTOs for request validation

### Technical Debt
- Keep synchronize: true during development
- Generate migrations before production deployment
- Add Redis caching (see REDIS_SETUP.md)
- Write unit tests for DTOs
