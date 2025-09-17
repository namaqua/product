import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join, resolve } from 'path';
import {
  HttpExceptionFilter,
  DatabaseExceptionFilter,
  AllExceptionsFilter,
  TransformInterceptor,
  LoggingInterceptor,
  TimeoutInterceptor,
  createValidationPipe,
} from './common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS - Allow frontend access
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // CRITICAL: Configure static assets with absolute paths
  // Use resolve to get absolute paths that work regardless of where the app runs from
  const projectRoot = resolve(__dirname, '..');
  const uploadsPath = resolve(projectRoot, '..', 'uploads'); // Go up one more level from dist
  const publicPath = resolve(projectRoot, '..', 'public');

  console.log('📁 Project root:', projectRoot);
  console.log('📁 Uploads path:', uploadsPath);
  console.log('📁 Public path:', publicPath);

  // Check if directories exist
  if (fs.existsSync(uploadsPath)) {
    console.log('✅ Uploads directory found');
    const files = fs.readdirSync(uploadsPath);
    console.log(`📁 Contains ${files.length} files`);

    // Serve uploads directory
    app.useStaticAssets(uploadsPath, {
      prefix: '/uploads',
      index: false,
    });
  } else {
    console.error('❌ Uploads directory not found at:', uploadsPath);
    // Try alternative path (if running from src instead of dist)
    const altUploadsPath = resolve(__dirname, '..', 'uploads');
    if (fs.existsSync(altUploadsPath)) {
      console.log('✅ Found uploads at alternative path:', altUploadsPath);
      app.useStaticAssets(altUploadsPath, {
        prefix: '/uploads',
        index: false,
      });
    }
  }

  // Serve public directory if it exists
  if (fs.existsSync(publicPath)) {
    console.log('✅ Public directory found');
    app.useStaticAssets(publicPath, {
      prefix: '/',
      index: false,
    });
  } else {
    // Try alternative path
    const altPublicPath = resolve(__dirname, '..', 'public');
    if (fs.existsSync(altPublicPath)) {
      console.log('✅ Found public at alternative path:', altPublicPath);
      app.useStaticAssets(altPublicPath, {
        prefix: '/',
        index: false,
      });
    }
  }

  // Global validation pipe with custom configuration
  app.useGlobalPipes(createValidationPipe());

  // Global exception filters (order matters - most specific first)
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new DatabaseExceptionFilter(),
    new HttpExceptionFilter(),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(30000), // 30 second timeout
    new TransformInterceptor(),
  );

  // API prefix - this MUST come AFTER static asset configuration
  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('My Engines API')
    .setDescription('Business Engines System API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Products', 'Product management endpoints')
    .addTag('Categories', 'Category management endpoints')
    .addTag('Attributes', 'Attribute management endpoints')
    .addTag('Media', 'Media management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3010;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
  console.log(`📡 API endpoints: http://localhost:${port}/api/v1`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🌐 CORS enabled for: http://localhost:5173`);
  console.log(`📁 Static files:`);
  console.log(`   - Test URL: http://localhost:${port}/uploads/test-static.jpg`);
  console.log(`   - Favicon: http://localhost:${port}/favicon.ico`);
  console.log(`🔍 Debug: __dirname = ${__dirname}`);
}
bootstrap();
