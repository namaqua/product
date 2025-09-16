import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  const configService = app.get(ConfigService);
  
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
  
  // Compression
  app.use(compression());
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  
  // CORS configuration
  const corsOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://104.248.247.65',
    'https://104.248.247.65',
  ];
  
  const envCorsOrigin = configService.get('CORS_ORIGIN');
  if (envCorsOrigin) {
    corsOrigins.push(...envCorsOrigin.split(','));
  }
  
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ Blocked CORS request from: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('PIM API')
    .setDescription('Product Information Management System API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('products', 'Product management')
    .addTag('categories', 'Category management')
    .addTag('attributes', 'Product attributes')
    .addTag('media', 'Media management')
    .addTag('variants', 'Product variants')
    .addTag('import-export', 'Data import/export')
    .addTag('search', 'Search functionality')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // Setup Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        active: true,
        theme: 'monokai',
      },
    },
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js',
    ],
  });
  
  // Graceful shutdown
  app.enableShutdownHooks();
  
  const port = configService.get('PORT') || configService.get('API_PORT') || 3010;
  const host = '0.0.0.0';
  
  await app.listen(port, host);
  
  console.log(`
    🚀 Application is running!
    🔗 API: http://${host}:${port}/api
    📚 Swagger: http://${host}:${port}/api/docs
    🏥 Health: http://${host}:${port}/api/health
    🌍 Environment: ${process.env.NODE_ENV || 'development'}
  `);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
