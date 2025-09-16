import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuditSubscriber } from '../common/subscribers/audit.subscriber';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DB_USER || process.env.DATABASE_USER,
    password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD,
    database: process.env.DB_NAME || process.env.DATABASE_NAME,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    subscribers: [AuditSubscriber],
    // CRITICAL: Set to false for production!
    synchronize: process.env.NODE_ENV === 'production' ? false : false, // Always false now
    logging: ['error', 'warn'],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    autoLoadEntities: true,
    retryAttempts: 3,
    retryDelay: 3000,
    extra: {
      max: 25,
      connectionTimeoutMillis: 5000,
    },
  }),
);
