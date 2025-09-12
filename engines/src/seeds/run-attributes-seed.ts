import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { seedAttributes } from './attributes-seed';

/**
 * Standalone script to seed only attributes
 * Run with: npm run seed:attributes
 */
async function runAttributeSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const dataSource = app.get(DataSource);
    
    console.log('🎯 Running Attributes Seed Only...\n');
    await seedAttributes(dataSource);
    console.log('\n✅ Attribute seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Attribute seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

runAttributeSeed();
