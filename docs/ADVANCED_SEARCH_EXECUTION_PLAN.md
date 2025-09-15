# Advanced Search Module - Execution Plan

## Project Overview
**Module**: Advanced Search & Filtering  
**Timeline**: December 14-21, 2024 (7 days)  
**Priority**: HIGH (Next Sprint)  
**Database**: PostgreSQL in Docker (port 5433) ⚠️ IMPORTANT  
**Search Engine**: Elasticsearch in Docker  

---

## 📋 Day-by-Day Execution Plan

### Day 1: Infrastructure Setup (December 14)
#### Morning (2-3 hours)
1. **Update Docker Compose** for Elasticsearch
   ```yaml
   # Add to docker-compose.yml
   elasticsearch:
     image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
     container_name: elasticsearch-pim
     environment:
       - discovery.type=single-node
       - xpack.security.enabled=false
       - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
     ports:
       - "9200:9200"
     volumes:
       - elasticsearch_data:/usr/share/elasticsearch/data
     networks:
       - product-network
   ```

2. **Create Setup Script**
   ```bash
   # /shell-scripts/setup-elasticsearch.sh
   docker-compose down elasticsearch
   docker-compose up -d elasticsearch
   # Wait for ES to be ready
   ./wait-for-elasticsearch.sh
   ```

3. **Test Elasticsearch Connection**
   ```bash
   curl -X GET "localhost:9200/_cluster/health?pretty"
   ```

#### Afternoon (3-4 hours)
4. **Install NestJS Dependencies**
   ```bash
   cd /Users/colinroets/dev/projects/product/engines
   npm install @nestjs/elasticsearch @elastic/elasticsearch
   npm install --save-dev @types/elasticsearch
   ```

5. **Create Search Module Structure**
   ```bash
   nest g module search
   nest g service search
   nest g controller search
   ```

6. **Setup Elasticsearch Configuration**
   - Create `/src/modules/search/config/elasticsearch.config.ts`
   - Add to app.module.ts
   - Environment variables setup

### Day 2: Core Search Service (December 15)
#### Morning (3-4 hours)
1. **Create Index Management Service**
   ```typescript
   // /src/modules/search/services/index-management.service.ts
   - createProductIndex()
   - deleteIndex()
   - updateMapping()
   - checkIndexHealth()
   ```

2. **Define Product Mapping**
   ```typescript
   // /src/modules/search/mappings/product.mapping.ts
   - Product fields mapping
   - Nested objects for attributes
   - Text analyzers setup
   ```

#### Afternoon (3-4 hours)
3. **Create Indexing Service**
   ```typescript
   // /src/modules/search/services/indexing.service.ts
   - indexProduct()
   - bulkIndexProducts()
   - updateDocument()
   - deleteDocument()
   ```

4. **Implement Real-time Sync**
   - Listen to Product events
   - Queue indexing jobs
   - Handle bulk operations

### Day 3: Search Implementation (December 16)
#### Morning (4 hours)
1. **Create Search Service**
   ```typescript
   // /src/modules/search/services/search.service.ts
   - searchProducts()
   - getAggregations()
   - getSuggestions()
   - getMoreLikeThis()
   ```

2. **Implement Query Builder**
   ```typescript
   // /src/modules/search/builders/query.builder.ts
   - buildMultiMatchQuery()
   - buildFilterQuery()
   - buildBoolQuery()
   - buildAggregations()
   ```

#### Afternoon (3-4 hours)
3. **Create Search DTOs**
   ```typescript
   // /src/modules/search/dto/
   - search-request.dto.ts
   - search-response.dto.ts
   - filter.dto.ts
   - aggregation.dto.ts
   ```

4. **Implement Search Controller**
   ```typescript
   // /src/modules/search/search.controller.ts
   POST /api/search/products
   GET  /api/search/suggestions
   POST /api/search/facets
   GET  /api/search/filters
   ```

### Day 4: Faceted Search & Aggregations (December 17)
#### Morning (4 hours)
1. **Implement Facet Service**
   ```typescript
   // /src/modules/search/services/facet.service.ts
   - getCategoryFacets()
   - getPriceFacets()
   - getAttributeFacets()
   - getBrandFacets()
   ```

2. **Create Aggregation Builders**
   ```typescript
   // /src/modules/search/builders/aggregation.builder.ts
   - buildTermsAggregation()
   - buildRangeAggregation()
   - buildNestedAggregation()
   - buildHistogramAggregation()
   ```

#### Afternoon (3-4 hours)
3. **Implement Filter Processing**
   ```typescript
   // /src/modules/search/services/filter.service.ts
   - processFilters()
   - validateFilters()
   - combineFilters()
   - cacheFilters()
   ```

4. **Add Redis Caching**
   - Cache aggregation results
   - Cache popular searches
   - Implement cache invalidation

### Day 5: Advanced Features (December 18)
#### Morning (4 hours)
1. **Implement Autocomplete**
   ```typescript
   // /src/modules/search/services/autocomplete.service.ts
   - getSuggestions()
   - getCompletions()
   - getDidYouMean()
   - trackSearchTerms()
   ```

2. **Add Search Analytics**
   ```typescript
   // /src/modules/search/services/analytics.service.ts
   - trackSearch()
   - trackClickThrough()
   - getPopularSearches()
   - getSearchMetrics()
   ```

#### Afternoon (3-4 hours)
3. **Implement Saved Searches**
   ```typescript
   // /src/modules/search/entities/saved-search.entity.ts
   - Create entity
   - CRUD operations
   - Alert notifications
   ```

4. **Add Search History**
   - Track user searches
   - Provide search history API
   - Clear history endpoint

### Day 6: Frontend Integration (December 19)
#### Morning (4 hours)
1. **Create Search Components**
   ```typescript
   // /admin/src/components/search/
   - SearchBar.tsx
   - SearchResults.tsx
   - FacetPanel.tsx
   - FilterChips.tsx
   ```

2. **Implement Search State Management**
   ```typescript
   // /admin/src/store/searchSlice.ts
   - Search state
   - Filter state
   - Facet state
   - History state
   ```

#### Afternoon (3-4 hours)
3. **Build Search UI**
   - Advanced search page
   - Quick search dropdown
   - Search filters sidebar
   - Results grid/list view

4. **Add Search Features**
   - Instant search
   - Search as you type
   - Filter persistence
   - URL state sync

### Day 7: Testing & Optimization (December 20)
#### Morning (3-4 hours)
1. **Write Tests**
   ```typescript
   // /src/modules/search/__tests__/
   - search.service.spec.ts
   - indexing.service.spec.ts
   - query.builder.spec.ts
   - search.controller.spec.ts
   ```

2. **Performance Testing**
   - Load testing with Artillery
   - Query performance analysis
   - Index optimization
   - Cache hit rates

#### Afternoon (3-4 hours)
3. **Documentation**
   - API documentation
   - Search query examples
   - Filter documentation
   - Performance guidelines

4. **Final Integration**
   - Full system test
   - Bug fixes
   - Code review
   - Deployment preparation

---

## 🔧 Technical Implementation Details

### Elasticsearch Index Structure
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "sku": { "type": "keyword" },
      "name": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": { "type": "completion" }
        }
      },
      "description": { "type": "text" },
      "price": { "type": "float" },
      "categories": {
        "type": "nested",
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" },
          "path": { "type": "text" }
        }
      },
      "attributes": {
        "type": "nested",
        "properties": {
          "name": { "type": "keyword" },
          "value": { "type": "text" },
          "type": { "type": "keyword" }
        }
      },
      "status": { "type": "keyword" },
      "created_at": { "type": "date" }
    }
  }
}
```

### API Endpoints
```typescript
// Search Endpoints
POST   /api/search/products         // Main search
GET    /api/search/suggestions      // Autocomplete
POST   /api/search/facets          // Get facets
GET    /api/search/filters         // Available filters
POST   /api/search/advanced        // Advanced search
GET    /api/search/history         // User search history
POST   /api/search/saved           // Save search
GET    /api/search/saved           // Get saved searches
DELETE /api/search/saved/:id       // Delete saved search

// Admin Endpoints
POST   /api/search/index/rebuild   // Rebuild index
GET    /api/search/index/status    // Index health
POST   /api/search/index/sync      // Force sync
GET    /api/search/analytics       // Search analytics
```

### Search Request Format
```typescript
interface SearchRequest {
  query?: string;
  filters?: {
    categories?: string[];
    priceRange?: { min: number; max: number };
    attributes?: { [key: string]: any };
    status?: string[];
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
  facets?: string[];
  suggest?: boolean;
}
```

---

## 📦 Required Dependencies
```json
{
  "@nestjs/elasticsearch": "^10.0.1",
  "@elastic/elasticsearch": "^8.11.0",
  "bull": "^4.11.5",
  "@nestjs/bull": "^10.0.1",
  "cache-manager": "^5.3.2",
  "@nestjs/cache-manager": "^2.1.1"
}
```

---

## 🚀 Shell Scripts to Create

### 1. Setup Elasticsearch
```bash
#!/bin/bash
# /shell-scripts/setup-elasticsearch.sh
echo "Setting up Elasticsearch for PIM..."
docker-compose up -d elasticsearch
sleep 10
curl -X GET "localhost:9200/_cluster/health?wait_for_status=yellow&timeout=30s"
echo "Elasticsearch ready!"
```

### 2. Index Management
```bash
#!/bin/bash
# /shell-scripts/manage-index.sh
case "$1" in
  create)
    curl -X PUT "localhost:9200/products"
    ;;
  delete)
    curl -X DELETE "localhost:9200/products"
    ;;
  rebuild)
    npm run search:reindex
    ;;
esac
```

### 3. Test Search
```bash
#!/bin/bash
# /shell-scripts/test-search.sh
TOKEN=$(./get-token.sh)
curl -X POST http://localhost:3010/api/search/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "laptop",
    "filters": {
      "priceRange": { "min": 500, "max": 2000 }
    }
  }'
```

---

## ⚠️ Important Considerations

### Docker Configuration
- **PostgreSQL**: Running on port 5433 (NOT 5432)
- **Elasticsearch**: Will run on port 9200
- **Redis**: Already configured on port 6380
- All services in `product-network`

### Database Access
```bash
# Always use Docker for database access
docker exec -it postgres-pim psql -U pim_user -d pim_dev

# NOT this (won't work):
psql -h localhost -p 5433 -U pim_user -d pim_dev
```

### Performance Targets
- Search response: <100ms
- Indexing: Real-time (<1s delay)
- Autocomplete: <50ms
- Facet calculation: <200ms

### Error Handling
- Fallback to database search if ES fails
- Queue failed indexing jobs
- Log all search analytics
- Handle partial failures gracefully

---

## 📊 Success Metrics
- [ ] All 20+ search endpoints working
- [ ] Real-time indexing operational
- [ ] Faceted search with 5+ facet types
- [ ] Autocomplete <50ms response
- [ ] Search results <100ms
- [ ] 95% cache hit rate
- [ ] Zero data inconsistencies
- [ ] Full test coverage

---

## 🔄 Daily Checklist
```bash
# Start of day
cd /Users/colinroets/dev/projects/product
docker-compose up -d
docker ps  # Verify all services
cd engines && npm run start:dev

# During development
git status
git add .
git commit -m "feat(search): [component] - description"

# End of day
npm test
./shell-scripts/test-search.sh
git push origin feature/advanced-search
```

---

## 📝 Documentation to Create
1. `SEARCH_API_DOCUMENTATION.md` - Full API docs
2. `SEARCH_QUERY_GUIDE.md` - Query syntax guide
3. `ELASTICSEARCH_SETUP.md` - ES configuration
4. `SEARCH_PERFORMANCE.md` - Optimization guide

---

**Created**: December 14, 2024  
**Author**: System Architect  
**Status**: Ready for Implementation  
**Next Step**: Start Day 1 - Infrastructure Setup
