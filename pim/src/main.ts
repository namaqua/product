import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS - Allow frontend access
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

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

  // API prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('PIM API')
    .setDescription('Product Information Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Products', 'Product management endpoints')
    .addTag('Categories', 'Category management endpoints')
    .addTag('Attributes', 'Attribute management endpoints')
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
}
bootstrap();
