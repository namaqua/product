import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Product, ProductStatus, ProductType } from './modules/products/entities/product.entity';
import { User, UserRole, UserStatus } from './modules/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const dataSource = app.get(DataSource);
    
    console.log('🌱 Starting database seeding...');
    
    // Create admin user if not exists
    const userRepository = dataSource.getRepository(User);
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@example.com' }
    });
    
    let adminUser: User;
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      adminUser = userRepository.create({
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        isActive: true,
      });
      await userRepository.save(adminUser);
      console.log('✅ Admin user created');
    } else {
      adminUser = existingAdmin;
      console.log('ℹ️ Admin user already exists');
    }
    
    // Create sample products
    const productRepository = dataSource.getRepository(Product);
    const existingProducts = await productRepository.count();
    
    if (existingProducts === 0) {
      const sampleProducts = [
        {
          sku: 'DEMO-001',
          name: 'Wireless Bluetooth Headphones',
          type: ProductType.SIMPLE,
          status: ProductStatus.PUBLISHED,
          description: 'Premium wireless headphones with active noise cancellation',
          shortDescription: 'Premium wireless headphones',
          price: 199.99,
          cost: 89.99,
          quantity: 50,
          manageStock: true,
          lowStockThreshold: 10,
          brand: 'AudioTech',
          manufacturer: 'AudioTech Inc.',
          features: ['Noise Cancellation', '30-hour battery', 'Bluetooth 5.0'],
          tags: ['electronics', 'audio', 'wireless'],
          isVisible: true,
          isFeatured: true,
          createdBy: adminUser.id,
          updatedBy: adminUser.id,
        },
        {
          sku: 'DEMO-002',
          name: 'Smart Watch Pro',
          type: ProductType.SIMPLE,
          status: ProductStatus.PUBLISHED,
          description: 'Advanced fitness tracker with heart rate monitoring',
          shortDescription: 'Smart fitness watch',
          price: 299.99,
          cost: 120.00,
          quantity: 30,
          manageStock: true,
          lowStockThreshold: 5,
          brand: 'TechFit',
          manufacturer: 'TechFit Corp.',
          features: ['Heart Rate Monitor', 'GPS', 'Water Resistant'],
          tags: ['electronics', 'fitness', 'wearable'],
          isVisible: true,
          isFeatured: true,
          createdBy: adminUser.id,
          updatedBy: adminUser.id,
        },
        {
          sku: 'DEMO-003',
          name: 'Portable Bluetooth Speaker',
          type: ProductType.SIMPLE,
          status: ProductStatus.PUBLISHED,
          description: 'Compact speaker with powerful bass',
          shortDescription: 'Portable speaker',
          price: 79.99,
          cost: 35.00,
          quantity: 100,
          manageStock: true,
          brand: 'AudioTech',
          manufacturer: 'AudioTech Inc.',
          features: ['Waterproof', '12-hour battery', 'Stereo pairing'],
          tags: ['electronics', 'audio', 'portable'],
          isVisible: true,
          createdBy: adminUser.id,
          updatedBy: adminUser.id,
        },
      ];
      
      for (const productData of sampleProducts) {
        const product = productRepository.create(productData);
        await productRepository.save(product);
        console.log(`✅ Product created: ${product.sku}`);
      }
    } else {
      console.log(`ℹ️ Products already exist (${existingProducts} found)`);
    }
    
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
