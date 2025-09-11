import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    AuthModule, // For guards and decorators
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Export service for use in other modules
})
export class ProductsModule {}
