# Redis Caching Setup

## 1. Install Dependencies
```bash
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store redis
npm install -D @types/cache-manager
```

## 2. Install Redis (Windows)
Download: https://github.com/microsoftarchive/redis/releases
Or use Docker:
```bash
docker run -d -p 6379:6379 redis:alpine
```

## 3. Add to .env
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=3600
```

## 4. Create cache.module.ts
```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        ttl: config.get('REDIS_TTL'),
      }),
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
```

## 5. Update app.module.ts
```typescript
import { RedisCacheModule } from './cache/cache.module';

@Module({
  imports: [
    RedisCacheModule,
    // ... other imports
  ],
})
```

## 6. Use in Service (Example: Surahs)
```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class SurahsService {
  constructor(
    @InjectRepository(Surah) private surahRepo: Repository<Surah>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    const cacheKey = 'surahs:all';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const surahs = await this.surahRepo.find({ order: { surahNumber: 'ASC' } });
    await this.cacheManager.set(cacheKey, surahs, 3600);
    return surahs;
  }
}
```

## 7. Test
```bash
# Start Redis
redis-server

# Start app
npm run start:dev

# First request (slow - hits DB)
curl http://localhost:3000/api/v1/quran/surahs

# Second request (fast - from cache)
curl http://localhost:3000/api/v1/quran/surahs
```

## Cache Invalidation
```typescript
// Clear specific cache
await this.cacheManager.del('surahs:all');

// Clear all cache
await this.cacheManager.reset();
```
