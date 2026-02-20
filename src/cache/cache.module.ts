import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 3600000, // 1 hour in milliseconds
      max: 100, // max items in cache
      isGlobal: true, // available everywhere
    }),
  ],
})
export class AppCacheModule {}
