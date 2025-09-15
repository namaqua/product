const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5433,
  database: 'pim_dev',
  user: 'pim_user',
  password: 'secure_password_change_me',
};

async function runMigration() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if tables already exist
    const checkQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('import_jobs', 'export_jobs', 'import_mappings');
    `;
    
    const result = await client.query(checkQuery);
    
    if (result.rows.length === 3) {
      console.log('✅ All tables already exist!');
      return;
    }

    console.log(`📋 Found ${result.rows.length} existing tables, creating missing ones...`);

    // Create tables
    const createTablesSQL = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Create import_jobs table if not exists
      CREATE TABLE IF NOT EXISTS import_jobs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        filepath VARCHAR(500),
        mapping JSONB,
        options JSONB,
        total_rows INTEGER DEFAULT 0,
        processed_rows INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        skip_count INTEGER DEFAULT 0,
        errors JSONB,
        summary JSONB,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        user_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create export_jobs table if not exists
      CREATE TABLE IF NOT EXISTS export_jobs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type VARCHAR(50) NOT NULL,
        format VARCHAR(50) NOT NULL DEFAULT 'csv',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        filename VARCHAR(255),
        filepath VARCHAR(500),
        download_url VARCHAR(500),
        filters JSONB,
        fields TEXT,
        options JSONB,
        total_records INTEGER DEFAULT 0,
        processed_records INTEGER DEFAULT 0,
        file_size INTEGER,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        expires_at TIMESTAMP,
        user_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create import_mappings table if not exists
      CREATE TABLE IF NOT EXISTS import_mappings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        mapping JSONB NOT NULL,
        transformations JSONB,
        defaults JSONB,
        validation JSONB,
        is_default BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        usage_count INTEGER DEFAULT 0,
        last_used_at TIMESTAMP,
        user_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS IDX_import_jobs_status ON import_jobs(status);
      CREATE INDEX IF NOT EXISTS IDX_import_jobs_type ON import_jobs(type);
      CREATE INDEX IF NOT EXISTS IDX_import_jobs_user_id ON import_jobs(user_id);
      CREATE INDEX IF NOT EXISTS IDX_export_jobs_status ON export_jobs(status);
      CREATE INDEX IF NOT EXISTS IDX_export_jobs_type ON export_jobs(type);
      CREATE INDEX IF NOT EXISTS IDX_export_jobs_user_id ON export_jobs(user_id);
      CREATE INDEX IF NOT EXISTS IDX_import_mappings_type ON import_mappings(type);
      CREATE INDEX IF NOT EXISTS IDX_import_mappings_user_id ON import_mappings(user_id);
      CREATE INDEX IF NOT EXISTS IDX_import_mappings_is_default ON import_mappings(is_default);
    `;

    console.log('🏗️ Creating tables...');
    await client.query(createTablesSQL);

    // Add foreign key constraints
    console.log('🔗 Adding foreign key constraints...');
    
    try {
      await client.query(`
        ALTER TABLE import_jobs 
        ADD CONSTRAINT FK_import_jobs_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
      `);
    } catch (err) {
      if (!err.message.includes('already exists')) throw err;
    }

    try {
      await client.query(`
        ALTER TABLE export_jobs 
        ADD CONSTRAINT FK_export_jobs_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
      `);
    } catch (err) {
      if (!err.message.includes('already exists')) throw err;
    }

    try {
      await client.query(`
        ALTER TABLE import_mappings 
        ADD CONSTRAINT FK_import_mappings_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
      `);
    } catch (err) {
      if (!err.message.includes('already exists')) throw err;
    }

    // Mark migration as complete
    console.log('📝 Marking migration as complete...');
    await client.query(`
      INSERT INTO migrations (timestamp, name) 
      VALUES (1734000000000, 'CreateImportExportTables1734000000000')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Verify tables
    const verifyResult = await client.query(checkQuery);
    
    if (verifyResult.rows.length === 3) {
      console.log('✅ All tables created successfully!');
      console.log('📋 Tables created:');
      verifyResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️ Some tables may not have been created properly');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
console.log('🚀 Starting Import/Export table migration...');
runMigration()
  .then(() => {
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
