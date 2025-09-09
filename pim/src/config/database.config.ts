import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuditSubscriber } from '../common/subscribers/audit.subscriber';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    subscribers: [AuditSubscriber],
    synchronize: process.env.NODE_ENV === 'development', // Auto-sync in development only
    logging: true, // Enable to debug queries
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    autoLoadEntities: true,
    retryAttempts: 3,
    retryDelay: 3000,
    extra: {
      max: 30, // Maximum number of clients in the pool
      connectionTimeoutMillis: 2000,
    },
  }),
);
