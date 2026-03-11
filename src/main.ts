import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Configuration
  const allowedOrigins = [
    'http://localhost:3001',
    'https://mushaf-platform-fe.vercel.app',
    /^https:\/\/mushaf-platform-fe-.*\.vercel\.app$/, // All Vercel preview deployments
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin matches allowed origins
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return origin === allowed;
        }
        return allowed.test(origin);
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties
      forbidNonWhitelisted: true, // throws error on unknown props
      transform: true, // auto-transforms payloads to DTO classes
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter()); // handles unhandled exceptions globally

  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Mushaf Platform API')  // Changed
    .setDescription('Digital Quran Platform with Urdu translations')  // Changed
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Development')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .addTag('auth', 'Authentication')
    .addTag('users', 'User management')
    .addTag('upload', 'File uploads')
    .addTag('Quran - Surahs', 'Surah endpoints')
    .addTag('Quran - Verses', 'Verse queries')
    .addTag('Quran - Juz', 'Juz navigation')
    .addTag('Quran - Pages', 'Page management')
    .addTag('Quran - Search', 'Search functionality')
    .addTag('Bookmarks & Reading Progress', 'User features')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
      tryItOutEnabled: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('API running on http://localhost:3000');
  console.log('API v1 available at http://localhost:3000/api/v1');
  console.log('Swagger documentation available at http://localhost:3000/api/docs');
}
bootstrap();
