import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

// Controllers
import { SearchController } from './controllers/search.controller';
import { SearchAdminController } from './controllers/search-admin.controller';

// Services
import { SearchService } from './services/search.service';
import { IndexingService } from './services/indexing.service';
import { FacetService } from './services/facet.service';
import { QueryBuilderService } from './services/query-builder.service';
import { IndexManagementService } from './services/index-management.service';

// Entities
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';

// Config
import elasticsearchConfig from './config/elasticsearch.config';

@Module({
  imports: [
    ConfigModule.forFeature(elasticsearchConfig),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('elasticsearch.node'),
        auth: configService.get('elasticsearch.auth'),
        maxRetries: configService.get('elasticsearch.maxRetries'),
        requestTimeout: configService.get('elasticsearch.requestTimeout'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Product, Category]),
    BullModule.registerQueue({
      name: 'search-indexing',
    }),
  ],
  controllers: [SearchController, SearchAdminController],
  providers: [
    SearchService,
    IndexingService,
    FacetService,
    QueryBuilderService,
    IndexManagementService,
  ],
  exports: [SearchService, IndexingService, IndexManagementService],
})
export class SearchModule {}
