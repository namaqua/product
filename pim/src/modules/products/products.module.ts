import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductSeeder } from './seeds/product.seed';
import {
  Product,
  ProductLocale,
  ProductVariant,
  ProductBundle,
  ProductRelationship,
  ProductAttribute,
  ProductMedia,
  ProductCategory,
} from './entities';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductLocale,
      ProductVariant,
      ProductBundle,
      ProductRelationship,
      ProductAttribute,
      ProductMedia,
      ProductCategory,
      User, // Added for seeder
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductSeeder],
  exports: [ProductsService, ProductSeeder],
})
export class ProductsModule {}
