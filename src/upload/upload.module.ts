import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { UsersModule } from '../users/users.module';
import { PagesModule } from '../quran/pages/pages.module';

@Module({
  imports: [UsersModule, PagesModule],
  controllers: [UploadController],
  providers: [UploadService, CloudinaryService],
  exports: [UploadService, CloudinaryService],
})
export class UploadModule {}
