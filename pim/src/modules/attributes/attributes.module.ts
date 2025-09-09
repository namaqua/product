import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributesController } from './attributes.controller';
import { AttributesService } from './attributes.service';
import {
  Attribute,
  AttributeGroup,
  AttributeOption,
  AttributeValue,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attribute,
      AttributeGroup,
      AttributeOption,
      AttributeValue,
    ]),
  ],
  controllers: [AttributesController],
  providers: [AttributesService],
  exports: [AttributesService],
})
export class AttributesModule {}
