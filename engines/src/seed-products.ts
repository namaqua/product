import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepository } from 'typeorm';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  console.log('Starting seed...');
  
  // Seed will be added here
  
  await app.close();
  console.log('Seed completed!');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
