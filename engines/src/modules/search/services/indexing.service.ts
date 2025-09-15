import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { ReindexOptionsDto, ReindexResultDto } from '../dto';

@Injectable()
export class IndexingService {
  private readonly logger = new Logger(IndexingService.name);
  private readonly productIndex: string;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    this.productIndex = this.configService.get('elasticsearch.indices.products');
  }

  async indexProduct(product: Product): Promise<void> {
    try {
      const document = this.transformProductToDocument(product);
      
      await this.elasticsearchService.index({
        index: this.productIndex,
        id: product.id,
        document,
      });

      this.logger.log(`Product ${product.sku} indexed successfully`);
    } catch (error) {
      this.logger.error(`Failed to index product ${product.sku}: ${error.message}`);
      throw error;
    }
  }

  async indexProductById(productId: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['categories', 'attributeValues', 'attributeValues.attribute', 'media'],
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    await this.indexProduct(product);
  }

  async bulkIndexProducts(products: Product[]): Promise<void> {
    if (!products.length) return;

    try {
      const operations = products.flatMap(product => [
        { index: { _index: this.productIndex, _id: product.id } },
        this.transformProductToDocument(product),
      ]);

      const response = await this.elasticsearchService.bulk({
        operations,
        refresh: true,
      });

      if (response.errors) {
        const errors = response.items.filter((item: any) => item.index?.error);
        this.logger.error(`Bulk indexing had ${errors.length} errors`);
      } else {
        this.logger.log(`Successfully indexed ${products.length} products`);
      }
    } catch (error) {
      this.logger.error(`Bulk indexing failed: ${error.message}`);
      throw error;
    }
  }

  async deleteDocument(productId: string): Promise<void> {
    try {
      await this.elasticsearchService.delete({
        index: this.productIndex,
        id: productId,
      });
      this.logger.log(`Product ${productId} removed from index`);
    } catch (error) {
      this.logger.error(`Failed to delete product ${productId}: ${error.message}`);
      throw error;
    }
  }

  async reindexAll(options: ReindexOptionsDto = {}): Promise<ReindexResultDto> {
    const startTime = Date.now();
    const { 
      batchSize = 100, 
      includeDeleted = false, 
      includeInactive = false,
      clearBeforeReindex = true,
    } = options;

    try {
      // Clear index if requested
      if (clearBeforeReindex) {
        await this.clearIndex();
      }

      // Build query
      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.categories', 'categories')
        .leftJoinAndSelect('product.attributeValues', 'attributeValues')
        .leftJoinAndSelect('attributeValues.attribute', 'attribute')
        .leftJoinAndSelect('product.media', 'media');

      if (!includeDeleted) {
        queryBuilder.andWhere('product.isDeleted = :isDeleted', { isDeleted: false });
      }

      if (!includeInactive) {
        queryBuilder.andWhere('product.isActive = :isActive', { isActive: true });
      }

      const totalCount = await queryBuilder.getCount();
      let indexed = 0;
      let failed = 0;
      const errors: string[] = [];

      // Process in batches
      for (let offset = 0; offset < totalCount; offset += batchSize) {
        const products = await queryBuilder
          .skip(offset)
          .take(batchSize)
          .getMany();

        try {
          await this.bulkIndexProducts(products);
          indexed += products.length;
        } catch (error) {
          failed += products.length;
          errors.push(`Batch ${offset}-${offset + batchSize}: ${error.message}`);
        }
      }

      const timeTaken = Date.now() - startTime;

      this.logger.log(`Reindexing complete: ${indexed} indexed, ${failed} failed in ${timeTaken}ms`);

      return {
        indexed,
        failed,
        timeTaken,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      this.logger.error(`Reindex failed: ${error.message}`);
      throw error;
    }
  }

  private async clearIndex(): Promise<void> {
    try {
      await this.elasticsearchService.deleteByQuery({
        index: this.productIndex,
        query: {
          match_all: {},
        },
      });
      this.logger.log('Index cleared');
    } catch (error) {
      this.logger.error(`Failed to clear index: ${error.message}`);
    }
  }

  private transformProductToDocument(product: Product): any {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      specialPrice: product.specialPrice,
      cost: product.cost,
      quantity: product.quantity,
      weight: product.weight,
      status: product.status,
      isVisible: product.isVisible,
      isFeatured: product.isFeatured,
      urlKey: product.urlKey,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      brand: product.brand,
      manufacturer: product.manufacturer,
      tags: product.tags,
      categories: product.categories?.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        level: cat.level,
      })) || [],
      attributes: product.attributeValues?.map(attrVal => ({
        id: attrVal.id,
        name: attrVal.attribute?.name,
        value: attrVal.getValue(), // Use getValue() method
        type: attrVal.attribute?.type,
      })) || [],
      media: product.media?.map(m => ({
        id: m.id,
        url: m.url,
        type: m.type,
        isPrimary: m.isPrimary,
      })) || [],
      parentId: product.parentId,
      variantCount: product.variants?.length || 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
