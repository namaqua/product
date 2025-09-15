import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { BullModule } from '@nestjs/bull';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ImportExportController } from './import-export.controller';
import { ImportExportService } from './import-export.service';
import { ImportJob } from './entities/import-job.entity';
import { ExportJob } from './entities/export-job.entity';
import { ImportMapping } from './entities/import-mapping.entity';
import { ProductImportProcessor } from './processors/product-import.processor';
import { VariantImportProcessor } from './processors/variant-import.processor';
import { ProductExportProcessor } from './processors/product-export.processor';
import { ImportValidator } from './validators/import.validator';
import { TemplateService } from './services/template.service';
import { MappingService } from './services/mapping.service';
import { ProductsModule } from '../products/products.module';
import { VariantsModule } from '../variants/variants.module';
import { CategoriesModule } from '../categories/categories.module';
import { AttributesModule } from '../attributes/attributes.module';
import { Product } from '../products/entities/product.entity';
// ProductVariant is handled as Product with parentId
import { Category } from '../categories/entities/category.entity';
import { Attribute } from '../attributes/entities/attribute.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImportJob,
      ExportJob,
      ImportMapping,
      Product,
      Category,
      Attribute,
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/imports',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(csv|xlsx|xls)$/)) {
          return callback(new Error('Only CSV and Excel files are allowed'), false);
        }
        callback(null, true);
      },
    }),
    BullModule.registerQueue(
      { name: 'import-queue' },
      { name: 'export-queue' }
    ),
    forwardRef(() => ProductsModule),
    forwardRef(() => VariantsModule),
    forwardRef(() => CategoriesModule),
    forwardRef(() => AttributesModule),
  ],
  controllers: [ImportExportController],
  providers: [
    ImportExportService,
    ProductImportProcessor,
    VariantImportProcessor,
    ProductExportProcessor,
    ImportValidator,
    TemplateService,
    MappingService,
  ],
  exports: [ImportExportService],
})
export class ImportExportModule {}
