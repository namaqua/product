import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  ParseFilePipeBuilder,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MediaService } from './media.service';
import {
  CreateMediaDto,
  UpdateMediaDto,
  MediaQueryDto,
  MediaResponseDto,
} from './dto';
import {
  CollectionResponse as CollectionResponseDto,
  ActionResponseDto,
} from '../../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

// Multer configuration
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
    callback(null, uniqueSuffix);
  },
});

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', { storage }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The file to upload',
        },
        alt: {
          type: 'string',
          description: 'Alternative text for accessibility',
        },
        title: {
          type: 'string',
          description: 'Media title',
        },
        description: {
          type: 'string',
          description: 'Media description',
        },
        sortOrder: {
          type: 'number',
          description: 'Sort order for display',
        },
        isPrimary: {
          type: 'boolean',
          description: 'Is this the primary media',
        },
        productIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Product IDs to associate with this media',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Media uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or request' })
  async upload(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024, // 10MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() createMediaDto: CreateMediaDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.mediaService.upload(file, createMediaDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all media files' })
  @ApiResponse({ status: 200, description: 'Media retrieved successfully' })
  async findAll(
    @Query() query: MediaQueryDto,
  ): Promise<CollectionResponseDto<MediaResponseDto>> {
    return this.mediaService.findAll(query);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get media for a specific product' })
  @ApiResponse({ status: 200, description: 'Product media retrieved successfully' })
  async getProductMedia(
    @Param('productId') productId: string,
  ): Promise<CollectionResponseDto<MediaResponseDto>> {
    return this.mediaService.getProductMedia(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  @ApiResponse({ status: 200, description: 'Media retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async findOne(@Param('id') id: string): Promise<MediaResponseDto> {
    return this.mediaService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update media metadata' })
  @ApiResponse({ status: 200, description: 'Media updated successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async update(
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    return this.mediaService.update(id, updateMediaDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete media file' })
  @ApiResponse({ status: 200, description: 'Media deleted successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    return this.mediaService.remove(id, userId);
  }

  @Post(':id/products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Associate media with products' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['productIds'],
      properties: {
        productIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Product IDs to associate',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Media associated successfully' })
  async associateWithProducts(
    @Param('id') id: string,
    @Body('productIds') productIds: string[],
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    return this.mediaService.associateWithProducts(id, productIds, userId);
  }

  @Delete(':id/products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dissociate media from products' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['productIds'],
      properties: {
        productIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Product IDs to dissociate',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Media dissociated successfully' })
  async dissociateFromProducts(
    @Param('id') id: string,
    @Body('productIds') productIds: string[],
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    return this.mediaService.dissociateFromProducts(id, productIds, userId);
  }

  @Post('bulk-delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete media files' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['ids'],
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Media IDs to delete',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Media deleted successfully' })
  async bulkDelete(
    @Body('ids') ids: string[],
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<{ affected: number }>> {
    return this.mediaService.bulkDelete(ids, userId);
  }
}
