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
import { AccountsModule } from './modules/accounts/accounts.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { MediaModule } from './modules/media/media.module';
import { VariantsModule } from './modules/variants/variants.module';
import { AddressesModule } from './modules/addresses/addresses.module';

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
    AccountsModule,
    AddressesModule,
    ProductsModule,
    CategoriesModule,
    AttributesModule,
    MediaModule,
    VariantsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseHealthService, AuditSubscriber],
})
export class AppModule {}
