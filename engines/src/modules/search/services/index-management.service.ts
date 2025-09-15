import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { IndexHealthDto, IndexStatsDto } from '../dto';

@Injectable()
export class IndexManagementService {
  private readonly logger = new Logger(IndexManagementService.name);
  private readonly productIndex: string;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {
    this.productIndex = this.configService.get('elasticsearch.indices.products');
  }

  async createProductIndex(): Promise<{ index: string; created: boolean }> {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.productIndex,
      });

      if (indexExists) {
        this.logger.log(`Index ${this.productIndex} already exists`);
        return { index: this.productIndex, created: false };
      }

      await this.elasticsearchService.indices.create({
        index: this.productIndex,
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          analysis: {
            analyzer: {
              autocomplete: {
                type: 'custom',
                tokenizer: 'autocomplete',
                filter: ['lowercase'],
              },
              autocomplete_search: {
                type: 'custom',
                tokenizer: 'lowercase',
              },
            },
            tokenizer: {
              autocomplete: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 10,
                token_chars: ['letter', 'digit'],
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            sku: { 
              type: 'keyword',
              fields: {
                text: { type: 'text' }
              }
            },
            name: { 
              type: 'text',
              fields: {
                keyword: { type: 'keyword' },
                suggest: { type: 'completion' }
              }
            },
            description: { 
              type: 'text',
              analyzer: 'standard'
            },
            shortDescription: { type: 'text' },
            price: { type: 'float' },
            specialPrice: { type: 'float' },
            cost: { type: 'float' },
            quantity: { type: 'integer' },
            weight: { type: 'float' },
            status: { type: 'keyword' },
            isVisible: { type: 'boolean' },
            isFeatured: { type: 'boolean' },
            urlKey: { 
              type: 'keyword',
              fields: {
                text: { type: 'text' }
              }
            },
            metaTitle: { type: 'text' },
            metaDescription: { type: 'text' },
            categories: {
              type: 'nested',
              properties: {
                id: { type: 'keyword' },
                name: { type: 'keyword' },
                slug: { type: 'keyword' },
                level: { type: 'integer' }
              }
            },
            attributes: {
              type: 'nested',
              properties: {
                id: { type: 'keyword' },
                name: { type: 'keyword' },
                value: { 
                  type: 'text',
                  fields: {
                    keyword: { type: 'keyword' }
                  }
                },
                type: { type: 'keyword' },
              }
            },
            media: {
              type: 'nested',
              properties: {
                id: { type: 'keyword' },
                url: { type: 'keyword' },
                type: { type: 'keyword' },
                isPrimary: { type: 'boolean' }
              }
            },
            brand: { 
              type: 'keyword',
              fields: {
                text: { type: 'text' }
              }
            },
            manufacturer: { type: 'keyword' },
            tags: { type: 'keyword' },
            variantCount: { type: 'integer' },
            parentId: { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        },
      });

      this.logger.log(`Index ${this.productIndex} created successfully`);
      return { index: this.productIndex, created: true };
    } catch (error) {
      this.logger.error(`Failed to create index: ${error.message}`);
      throw error;
    }
  }

  async deleteIndex(indexName: string): Promise<{ index: string; deleted: boolean }> {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: indexName,
      });

      if (!indexExists) {
        this.logger.log(`Index ${indexName} does not exist`);
        return { index: indexName, deleted: false };
      }

      await this.elasticsearchService.indices.delete({
        index: indexName,
      });

      this.logger.log(`Index ${indexName} deleted successfully`);
      return { index: indexName, deleted: true };
    } catch (error) {
      this.logger.error(`Failed to delete index: ${error.message}`);
      throw error;
    }
  }

  async getIndexHealth(): Promise<IndexHealthDto> {
    try {
      const health = await this.elasticsearchService.cluster.health({
        index: this.productIndex,
      });
      
      const stats = await this.elasticsearchService.indices.stats({
        index: this.productIndex,
      });

      const indexStats = stats.indices?.[this.productIndex];

      return {
        status: health.status,
        index: this.productIndex,
        docs: indexStats?.primaries?.docs?.count || 0,
        size: this.formatBytes(indexStats?.primaries?.store?.size_in_bytes || 0),
        shards: 1,
        replicas: 0,
        health: health.status,
      };
    } catch (error) {
      this.logger.error(`Failed to get index health: ${error.message}`);
      throw error;
    }
  }

  async getIndexStats(): Promise<IndexStatsDto> {
    try {
      const stats = await this.elasticsearchService.indices.stats({
        index: this.productIndex,
      });

      const indexStats = stats.indices?.[this.productIndex];
      const sizeInBytes = indexStats?.primaries?.store?.size_in_bytes || 0;

      return {
        totalDocs: indexStats?.primaries?.docs?.count || 0,
        totalSizeBytes: sizeInBytes,
        totalSize: this.formatBytes(sizeInBytes),
        createdAt: new Date(), // TODO: Get actual creation date
        searchCount: indexStats?.primaries?.search?.query_total || 0,
        avgSearchTime: indexStats?.primaries?.search?.query_time_in_millis 
          ? (indexStats.primaries.search.query_time_in_millis / (indexStats.primaries.search.query_total || 1))
          : 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get index stats: ${error.message}`);
      throw error;
    }
  }

  async refreshIndex(): Promise<void> {
    try {
      await this.elasticsearchService.indices.refresh({
        index: this.productIndex,
      });
      this.logger.log(`Index ${this.productIndex} refreshed`);
    } catch (error) {
      this.logger.error(`Failed to refresh index: ${error.message}`);
      throw error;
    }
  }

  async optimizeIndex(): Promise<void> {
    try {
      await this.elasticsearchService.indices.forcemerge({
        index: this.productIndex,
        max_num_segments: 1,
      });
      this.logger.log(`Index ${this.productIndex} optimization started`);
    } catch (error) {
      this.logger.error(`Failed to optimize index: ${error.message}`);
      throw error;
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
