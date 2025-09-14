import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Debug logging
console.log('TypeORM Config - Database Connection Parameters:');
console.log('  Host:', process.env.DATABASE_HOST || 'localhost');
console.log('  Port:', process.env.DATABASE_PORT || '5432');
console.log('  Database:', process.env.DATABASE_NAME);
console.log('  Username:', process.env.DATABASE_USER);
console.log('  Password:', process.env.DATABASE_PASSWORD ? '***hidden***' : 'NOT SET');

const port = process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432;

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: port,
  username: process.env.DATABASE_USER || 'pim_user',
  password: process.env.DATABASE_PASSWORD || 'secure_password_change_me',
  database: process.env.DATABASE_NAME || 'pim_dev',
  entities: [path.join(__dirname, 'src', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'src', 'migrations', '*{.ts,.js}')],
  synchronize: false,
  logging: true,
});
