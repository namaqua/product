import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariantTemplate } from './entities/variant-template.entity';
import { VariantTemplateService } from './variant-template.service';
import { VariantTemplateController } from './variant-template.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([VariantTemplate]),
  ],
  controllers: [VariantTemplateController],
  providers: [VariantTemplateService],
  exports: [VariantTemplateService],
})
export class VariantsModule {}
