import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Product, ProductStatus, ProductType } from './modules/products/entities/product.entity';
import { User, UserRole, UserStatus } from './modules/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { seedAttributes } from './seeds/attributes-seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const dataSource = app.get(DataSource);
    
    console.log('🌱 Starting database seeding...');
    
    // Seed attributes first (they're used by products)
    await seedAttributes(dataSource);
    console.log('');
    
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
          description: 'Premium wireless headphones with active noise cancellation, designed for audiophiles and music enthusiasts.',
          shortDescription: 'Premium wireless headphones',
          price: 199.99,
          cost: 89.99,
          quantity: 50,
          manageStock: true,
          lowStockThreshold: 10,
          brand: 'AudioTech',
          manufacturer: 'AudioTech Inc.',
          weight: 0.25,
          attributes: {
            connectivity: 'Bluetooth 5.0',
            battery_life: '30 hours',
            water_resistance: 'IPX4',
            color: 'Black',
            material: 'Plastic, Leather',
            warranty_period: '2 Years',
            is_wireless: true,
            is_rechargeable: true,
          },
          features: ['Noise Cancellation', '30-hour battery', 'Bluetooth 5.0'],
          tags: ['electronics', 'audio', 'wireless', 'headphones'],
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
          description: 'Advanced fitness tracker with heart rate monitoring, GPS tracking, and smartphone integration.',
          shortDescription: 'Smart fitness watch',
          price: 299.99,
          cost: 120.00,
          quantity: 30,
          manageStock: true,
          lowStockThreshold: 5,
          brand: 'TechFit',
          manufacturer: 'TechFit Corp.',
          weight: 0.05,
          attributes: {
            screen_size: '1.4',
            water_resistance: 'IP68',
            battery_life: '7',
            connectivity: 'Bluetooth, WiFi',
            material: 'Aluminum, Silicone',
            warranty_period: '1 Year',
            is_wireless: true,
            is_rechargeable: true,
            smart_features: 'Heart Rate Monitor, GPS, Sleep Tracking',
          },
          features: ['Heart Rate Monitor', 'GPS', 'Water Resistant'],
          tags: ['electronics', 'fitness', 'wearable', 'smartwatch'],
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
          description: 'Compact speaker with powerful bass, perfect for outdoor adventures and parties.',
          shortDescription: 'Portable speaker',
          price: 79.99,
          cost: 35.00,
          quantity: 100,
          manageStock: true,
          brand: 'AudioTech',
          manufacturer: 'AudioTech Inc.',
          weight: 0.8,
          attributes: {
            battery_life: '12',
            water_resistance: 'IPX7',
            connectivity: 'Bluetooth 5.2',
            power_consumption: '20',
            color: 'Blue',
            material: 'Rubber, Plastic',
            warranty_period: '1 Year',
            is_wireless: true,
            is_rechargeable: true,
            is_fragile: false,
          },
          features: ['Waterproof', '12-hour battery', 'Stereo pairing'],
          tags: ['electronics', 'audio', 'portable', 'speaker'],
          isVisible: true,
          createdBy: adminUser.id,
          updatedBy: adminUser.id,
        },
        {
          sku: 'DEMO-004',
          name: 'Classic Cotton T-Shirt',
          type: ProductType.SIMPLE,
          status: ProductStatus.PUBLISHED,
          description: 'Comfortable everyday t-shirt made from 100% organic cotton. Perfect for casual wear.',
          shortDescription: 'Classic cotton t-shirt',
          price: 29.99,
          cost: 12.00,
          quantity: 200,
          manageStock: true,
          lowStockThreshold: 20,
          brand: 'ComfortWear',
          manufacturer: 'TextileCorp',
          weight: 0.15,
          attributes: {
            material: 'Cotton',
            material_composition: '100% Organic Cotton',
            care_instructions: 'Machine Washable, Tumble Dry Low',
            color: 'White',
            size: 'M',
            country_of_origin: 'USA',
            is_eco_friendly: true,
          },
          features: ['Organic Cotton', 'Machine Washable', 'Breathable'],
          tags: ['clothing', 'casual', 'cotton', 't-shirt'],
          isVisible: true,
          isFeatured: false,
          createdBy: adminUser.id,
          updatedBy: adminUser.id,
        },
        {
          sku: 'DEMO-005',
          name: 'Ergonomic Office Chair',
          type: ProductType.SIMPLE,
          status: ProductStatus.PUBLISHED,
          description: 'Professional office chair with lumbar support and adjustable height. Designed for long working hours.',
          shortDescription: 'Ergonomic office chair',
          price: 449.99,
          cost: 180.00,
          quantity: 15,
          manageStock: true,
          lowStockThreshold: 3,
          brand: 'WorkComfort',
          manufacturer: 'FurniturePro',
          weight: 15.5,
          attributes: {
            material: 'Mesh, Plastic, Metal',
            color: 'Black',
            dimensions_length: '70',
            dimensions_width: '65',
            dimensions_height: '120',
            assembly_required: true,
            assembly_time: '30-60 minutes',
            warranty_period: '3 Years',
            certifications: 'BIFMA Certified',
            expected_lifespan: '5-10 Years',
          },
          features: ['Lumbar Support', 'Adjustable Height', 'Breathable Mesh'],
          tags: ['furniture', 'office', 'chair', 'ergonomic'],
          isVisible: true,
          isFeatured: false,
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
