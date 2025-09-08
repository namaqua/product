import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function initDatabase() {
  console.log('🔧 Initializing database schema...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  console.log('✅ Database schema created!');
  console.log('Now checking tables...');
  
  // Get the connection and show tables
  const connection = app.get('DataSource');
  const tables = await connection.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);
  
  console.log('Tables created:');
  tables.forEach((table: any) => {
    console.log(`  - ${table.tablename}`);
  });
  
  // Check for the problematic 'name' column
  const productColumns = await connection.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'products'
    ORDER BY ordinal_position;
  `);
  
  const hasNameColumn = productColumns.some((col: any) => col.column_name === 'name');
  
  if (hasNameColumn) {
    console.log('❌ ERROR: "name" column exists in products table!');
  } else {
    console.log('✅ CORRECT: No "name" column in products table');
  }
  
  await app.close();
  process.exit(0);
}

initDatabase().catch(error => {
  console.error('❌ Database initialization failed:', error.message);
  process.exit(1);
});
