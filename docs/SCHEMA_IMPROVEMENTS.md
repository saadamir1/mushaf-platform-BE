# Schema Improvements

## Changes Made - 2026-02-22

### Verse Entity
**Added:**
- `transliteration` - Romanized Arabic text (e.g., "Bismillah ir-Rahman ir-Rahim")
- `sajdahType` - Prostration marker ("recommended" | "obligatory")
- `audioUrl` - Link to verse recitation (for future audio feature)

### Surah Entity
**Added:**
- `nameTransliteration` - Romanized name (e.g., "Al-Fatihah")
- `orderOfRevelation` - Historical revelation order (1-114)

### Page Entity
**Changed:**
- Replaced `startVerseId`, `endVerseId`, `startSurahNumber`, `endSurahNumber`
- With `startVerse`, `endVerse` using format "surahNumber:verseNumber" (e.g., "1:1")
- More stable and readable

### Juz Entity
**Changed:**
- Replaced `startVerseId`, `endVerseId`, `startSurahNumber`, `endSurahNumber`
- With `startVerse`, `endVerse` using format "surahNumber:verseNumber"

## Benefits

1. **Better for non-Arabic readers** - Transliteration support
2. **Audio recitation ready** - audioUrl field prepared
3. **Prostration markers** - Important for prayer
4. **Stable references** - Verse notation won't break if IDs change
5. **Historical context** - Revelation order for scholars

## Migration Note

Since `synchronize: true` is ON, changes will auto-apply on next server start.
No manual migration needed during development.
