import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Product,
  ProductLocale,
  ProductMedia,
  ProductAttribute,
  ProductStatus,
  ProductType,
  MediaType,
} from '../entities';
import { User, UserRole, UserStatus } from '../../users/entities/user.entity';

@Injectable()
export class ProductSeeder {
  private readonly logger = new Logger(ProductSeeder.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductLocale)
    private readonly localeRepository: Repository<ProductLocale>,
    @InjectRepository(ProductMedia)
    private readonly mediaRepository: Repository<ProductMedia>,
    @InjectRepository(ProductAttribute)
    private readonly attributeRepository: Repository<ProductAttribute>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting product seeding...');

    // Get or create admin user
    let adminUser = await this.userRepository.findOne({
      where: { email: 'admin@example.com' },
    });

    if (!adminUser) {
      adminUser = await this.userRepository.save({
        email: 'admin@example.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isActive: true,
        emailVerified: true,
      });
    }

    // Sample products data
    const products = [
      {
        sku: 'LAPTOP-001',
        type: ProductType.SIMPLE,
        status: ProductStatus.PUBLISHED,
        quantity: 50,
        price: 1299.99,
        comparePrice: 1499.99,
        weight: 2.5,
        weightUnit: 'kg',
        isVisible: true,
        isFeatured: true,
        locales: [
          {
            localeCode: 'en',
            name: 'Professional Laptop Pro 15"',
            description:
              'High-performance laptop with 15" display, Intel Core i7 processor, 16GB RAM, and 512GB SSD. Perfect for professionals and content creators.',
            shortDescription: 'Professional laptop with powerful specs',
            metaTitle: 'Professional Laptop Pro 15" - High Performance',
            metaDescription:
              'Buy Professional Laptop Pro 15" with Intel Core i7, 16GB RAM, 512GB SSD',
          },
        ],
        attributes: [
          { attributeCode: 'processor', valueText: 'Intel Core i7-11800H' },
          { attributeCode: 'ram', valueText: '16GB DDR4' },
          { attributeCode: 'storage', valueText: '512GB NVMe SSD' },
          { attributeCode: 'display', valueText: '15.6" FHD IPS' },
          { attributeCode: 'brand', valueText: 'TechPro' },
        ],
        media: [
          {
            url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
            mediaType: MediaType.IMAGE,
            isPrimary: true,
            altText: 'Professional Laptop Pro 15"',
          },
        ],
      },
      {
        sku: 'PHONE-001',
        type: ProductType.SIMPLE,
        status: ProductStatus.PUBLISHED,
        quantity: 100,
        price: 899.99,
        comparePrice: 999.99,
        weight: 0.2,
        weightUnit: 'kg',
        isVisible: true,
        isFeatured: true,
        locales: [
          {
            localeCode: 'en',
            name: 'SmartPhone X Pro 256GB',
            description:
              'Latest flagship smartphone with advanced camera system, 5G connectivity, and all-day battery life.',
            shortDescription: 'Flagship smartphone with 5G',
            metaTitle: 'SmartPhone X Pro 256GB - 5G Flagship',
            metaDescription:
              'Buy SmartPhone X Pro with 256GB storage, 5G connectivity, and advanced cameras',
          },
        ],
        attributes: [
          { attributeCode: 'storage', valueText: '256GB' },
          { attributeCode: 'ram', valueText: '8GB' },
          { attributeCode: 'display', valueText: '6.7" OLED' },
          { attributeCode: 'camera', valueText: '108MP Triple Camera' },
          { attributeCode: 'brand', valueText: 'TechPhone' },
          { attributeCode: 'color', valueText: 'Midnight Black' },
        ],
        media: [
          {
            url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd',
            mediaType: MediaType.IMAGE,
            isPrimary: true,
            altText: 'SmartPhone X Pro',
          },
        ],
      },
      {
        sku: 'HEADPHONES-001',
        type: ProductType.SIMPLE,
        status: ProductStatus.PUBLISHED,
        quantity: 200,
        price: 349.99,
        weight: 0.3,
        weightUnit: 'kg',
        isVisible: true,
        locales: [
          {
            localeCode: 'en',
            name: 'Wireless Noise-Canceling Headphones',
            description:
              'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality.',
            shortDescription: 'Premium wireless ANC headphones',
            metaTitle: 'Wireless Noise-Canceling Headphones',
            metaDescription: 'Buy premium wireless headphones with ANC and 30-hour battery',
          },
        ],
        attributes: [
          { attributeCode: 'battery_life', valueText: '30 hours' },
          { attributeCode: 'connectivity', valueText: 'Bluetooth 5.2' },
          { attributeCode: 'noise_cancellation', valueBoolean: true },
          { attributeCode: 'brand', valueText: 'AudioPro' },
          { attributeCode: 'color', valueText: 'Black' },
        ],
        media: [
          {
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
            mediaType: MediaType.IMAGE,
            isPrimary: true,
            altText: 'Wireless Headphones',
          },
        ],
      },
      {
        sku: 'TABLET-001',
        type: ProductType.SIMPLE,
        status: ProductStatus.PUBLISHED,
        quantity: 75,
        price: 599.99,
        weight: 0.5,
        weightUnit: 'kg',
        isVisible: true,
        locales: [
          {
            localeCode: 'en',
            name: 'Digital Tablet Pro 11"',
            description:
              'Versatile tablet with 11" display, perfect for work and entertainment. Includes stylus support.',
            shortDescription: 'Versatile 11" tablet with stylus',
            metaTitle: 'Digital Tablet Pro 11" with Stylus Support',
            metaDescription: 'Buy Digital Tablet Pro 11" for work and entertainment',
          },
        ],
        attributes: [
          { attributeCode: 'display', valueText: '11" Liquid Retina' },
          { attributeCode: 'storage', valueText: '128GB' },
          { attributeCode: 'processor', valueText: 'M1 Chip' },
          { attributeCode: 'brand', valueText: 'TechTab' },
        ],
        media: [
          {
            url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0',
            mediaType: MediaType.IMAGE,
            isPrimary: true,
            altText: 'Digital Tablet Pro',
          },
        ],
      },
      {
        sku: 'WATCH-001',
        type: ProductType.SIMPLE,
        status: ProductStatus.PUBLISHED,
        quantity: 150,
        price: 399.99,
        weight: 0.05,
        weightUnit: 'kg',
        isVisible: true,
        locales: [
          {
            localeCode: 'en',
            name: 'Smart Fitness Watch',
            description:
              'Advanced fitness tracking smartwatch with heart rate monitor, GPS, and water resistance.',
            shortDescription: 'Fitness smartwatch with GPS',
            metaTitle: 'Smart Fitness Watch with GPS',
            metaDescription: 'Buy Smart Fitness Watch with heart rate monitor and GPS tracking',
          },
        ],
        attributes: [
          { attributeCode: 'water_resistance', valueText: '5ATM' },
          { attributeCode: 'battery_life', valueText: '7 days' },
          { attributeCode: 'gps', valueBoolean: true },
          { attributeCode: 'brand', valueText: 'FitTech' },
          { attributeCode: 'color', valueText: 'Space Gray' },
        ],
        media: [
          {
            url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
            mediaType: MediaType.IMAGE,
            isPrimary: true,
            altText: 'Smart Fitness Watch',
          },
        ],
      },
      {
        sku: 'CAMERA-001',
        type: ProductType.SIMPLE,
        status: ProductStatus.DRAFT,
        quantity: 25,
        price: 2499.99,
        weight: 1.2,
        weightUnit: 'kg',
        isVisible: false,
        locales: [
          {
            localeCode: 'en',
            name: 'Professional DSLR Camera',
            description:
              'Professional-grade DSLR camera with 45MP full-frame sensor and 4K video recording.',
            shortDescription: 'Professional DSLR with 45MP sensor',
            metaTitle: 'Professional DSLR Camera 45MP',
            metaDescription: 'Buy Professional DSLR Camera with 45MP sensor and 4K video',
          },
        ],
        attributes: [
          { attributeCode: 'sensor', valueText: '45MP Full-Frame' },
          { attributeCode: 'video', valueText: '4K 60fps' },
          { attributeCode: 'iso_range', valueText: '100-51200' },
          { attributeCode: 'brand', valueText: 'PhotoPro' },
        ],
        media: [
          {
            url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
            mediaType: MediaType.IMAGE,
            isPrimary: true,
            altText: 'Professional DSLR Camera',
          },
        ],
      },
    ];

    // Create products
    for (const productData of products) {
      const existingProduct = await this.productRepository.findOne({
        where: { sku: productData.sku },
      });

      if (existingProduct) {
        this.logger.log(`Product ${productData.sku} already exists, skipping...`);
        continue;
      }

      const { locales, attributes, media, ...productInfo } = productData;

      const product = await this.productRepository.save({
        ...productInfo,
        version: 1,
        createdBy: adminUser,
        updatedBy: adminUser,
      });

      // Create locales
      if (locales?.length) {
        for (const locale of locales) {
          await this.localeRepository.save({
            ...locale,
            productId: product.id,
          });
        }
      }

      // Create attributes
      if (attributes?.length) {
        for (const attribute of attributes) {
          await this.attributeRepository.save({
            ...attribute,
            productId: product.id,
          });
        }
      }

      // Create media
      if (media?.length) {
        for (const mediaItem of media) {
          await this.mediaRepository.save({
            ...mediaItem,
            productId: product.id,
          });
        }
      }

      this.logger.log(`Created product: ${product.sku}`);
    }

    this.logger.log('Product seeding completed!');
  }
}
