import { registerAs } from '@nestjs/config';

export default registerAs('elasticsearch', () => ({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  maxRetries: 10,
  requestTimeout: 60000,
  pingTimeout: 60000,
  sniffOnStart: false,
  auth: process.env.ELASTICSEARCH_AUTH ? {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  } : undefined,
  indices: {
    products: process.env.ELASTICSEARCH_PRODUCTS_INDEX || 'pim_products',
    categories: process.env.ELASTICSEARCH_CATEGORIES_INDEX || 'pim_categories',
  },
}));
