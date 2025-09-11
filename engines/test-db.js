const { DataSource } = require('typeorm');
const path = require('path');

async function testConnection() {
  console.log('Testing database connection...');
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER || 'pim_user',
    password: process.env.DATABASE_PASSWORD || 'secure_password_change_me',
    database: process.env.DATABASE_NAME || 'pim_dev',
    entities: [path.join(__dirname, '**/*.entity.js')],
    synchronize: true,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected!');
    
    const tables = await dataSource.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `);
    
    console.log('Tables:', tables.map(t => t.tablename).join(', '));
    
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
