import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.DATABASE_PORT || '5433', 10),
  username: process.env.DB_USER || process.env.DATABASE_USER || 'pim_user',
  password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD,
  database: process.env.DB_NAME || process.env.DATABASE_NAME || 'pim_dev',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
  synchronize: false, // Never use synchronize in production
  logging: !isProduction,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;
