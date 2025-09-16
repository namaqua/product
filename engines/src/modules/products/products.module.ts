import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductAttributesService } from './services/product-attributes.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { AuthModule } from '../auth/auth.module';
import { AttributesModule } from '../attributes/attributes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]),
    AuthModule, // For guards and decorators
    forwardRef(() => AttributesModule), // For attribute management
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductAttributesService],
  exports: [ProductsService, ProductAttributesService], // Export services for use in other modules
})
export class ProductsModule {}
