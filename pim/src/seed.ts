import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductSeeder } from './modules/products/seeds/product.seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const seeder = app.get(ProductSeeder);
    await seeder.seed();
    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
