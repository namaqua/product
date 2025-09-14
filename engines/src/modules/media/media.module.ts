import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Media } from './entities/media.entity';
import { Product } from '../products/entities/product.entity';
import { MediaService } from './media.service';
import { EnhancedMediaService } from './services/enhanced-media.service';
import { MediaProcessorService } from './services/media-processor.service';
import { EnhancedMediaController } from './enhanced-media.controller';
import * as path from 'path';
import * as fs from 'fs';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media, Product]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uploadPath = configService.get<string>('UPLOAD_PATH', './uploads');
        
        // Ensure upload directories exist
        const dirs = [
          uploadPath,
          path.join(uploadPath, 'thumbnails'),
          path.join(uploadPath, 'temp'),
          path.join(uploadPath, 'documents'),
          path.join(uploadPath, 'images'),
        ];
        
        for (const dir of dirs) {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
        }
        
        return {
          dest: uploadPath,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [EnhancedMediaController],
  providers: [
    MediaService,
    EnhancedMediaService,
    MediaProcessorService,
  ],
  exports: [
    MediaService,
    EnhancedMediaService,
    MediaProcessorService,
  ],
})
export class MediaModule {}
