import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuditSubscriber } from '../common/subscribers/audit.subscriber';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Use consistent environment variable names
    const host = process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || process.env.DATABASE_PORT || '5432', 10);
    const username = process.env.DB_USER || process.env.DATABASE_USER || 'pim_user';
    const password = process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD;
    const database = process.env.DB_NAME || process.env.DATABASE_NAME || 'pim_dev';
    
    console.log(`🔧 Database Configuration:
      Host: ${host}
      Port: ${port}
      Database: ${database}
      User: ${username}
      SSL: ${isProduction ? 'Enabled' : 'Disabled'}
    `);
    
    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      subscribers: [AuditSubscriber],
      synchronize: !isProduction, // Never sync in production
      logging: isProduction ? ['error', 'warn'] : ['error', 'warn', 'query'],
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      retryAttempts: 5,
      retryDelay: 3000,
      extra: {
        max: isProduction ? 25 : 10, // Connection pool size
        connectionTimeoutMillis: 5000, // Increased timeout
        idleTimeoutMillis: 30000,
        statement_timeout: 30000, // 30 second statement timeout
      },
    };
  },
);
