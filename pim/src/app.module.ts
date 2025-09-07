import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { DatabaseHealthService } from './config/database-health.service';
import { AuditSubscriber } from './common/subscribers/audit.subscriber';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Configuration Module - Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
    }),

    // TypeORM Module - Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        // Override some settings if needed in development
        ...(process.env.NODE_ENV === 'development' && {
          logger: 'advanced-console',
          logging: ['error', 'warn', 'migration'],
        }),
      }),
      inject: [ConfigService],
    }),
    
    // Feature Modules
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseHealthService, AuditSubscriber],
})
export class AppModule {}
