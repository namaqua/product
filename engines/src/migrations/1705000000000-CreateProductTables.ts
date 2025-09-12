import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateProductTables1705000000000 implements MigrationInterface {
  name = 'CreateProductTables1705000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if products table already exists
    const productsTableExists = await queryRunner.hasTable('products');
    
    if (!productsTableExists) {
      // Create products table
      await queryRunner.createTable(
        new Table({
          name: 'products',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              default: 'gen_random_uuid()',
            },
            {
              name: 'sku',
              type: 'varchar',
              length: '100',
              isUnique: true,
            },
            {
              name: 'name',
              type: 'varchar',
              length: '255',
            },
            {
              name: 'description',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'shortDescription',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'type',
              type: 'enum',
              enum: ['simple', 'configurable', 'bundle', 'virtual'],
              default: "'simple'",
            },
            {
              name: 'status',
              type: 'enum',
              enum: ['draft', 'pending_review', 'approved', 'published', 'archived'],
              default: "'draft'",
            },
            {
              name: 'parentId',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'price',
              type: 'decimal',
              precision: 10,
              scale: 2,
              isNullable: true,
            },
            {
              name: 'cost',
              type: 'decimal',
              precision: 10,
              scale: 2,
              isNullable: true,
            },
            {
              name: 'specialPrice',
              type: 'decimal',
              precision: 10,
              scale: 2,
              isNullable: true,
            },
            {
              name: 'specialPriceFrom',
              type: 'timestamptz',
              isNullable: true,
            },
            {
              name: 'specialPriceTo',
              type: 'timestamptz',
              isNullable: true,
            },
            {
              name: 'quantity',
              type: 'integer',
              default: 0,
            },
            {
              name: 'manageStock',
              type: 'boolean',
              default: true,
            },
            {
              name: 'inStock',
              type: 'boolean',
              default: true,
            },
            {
              name: 'lowStockThreshold',
              type: 'integer',
              isNullable: true,
            },
            {
              name: 'weight',
              type: 'decimal',
              precision: 10,
              scale: 3,
              isNullable: true,
            },
            {
              name: 'length',
              type: 'decimal',
              precision: 10,
              scale: 2,
              isNullable: true,
            },
            {
              name: 'width',
              type: 'decimal',
              precision: 10,
              scale: 2,
              isNullable: true,
            },
            {
              name: 'height',
              type: 'decimal',
              precision: 10,
              scale: 2,
              isNullable: true,
            },
            {
              name: 'metaTitle',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'metaDescription',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'metaKeywords',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'urlKey',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'barcode',
              type: 'varchar',
              length: '50',
              isNullable: true,
            },
            {
              name: 'mpn',
              type: 'varchar',
              length: '100',
              isNullable: true,
            },
            {
              name: 'brand',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'manufacturer',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'attributes',
              type: 'jsonb',
              isNullable: true,
            },
            {
              name: 'features',
              type: 'jsonb',
              isNullable: true,
            },
            {
              name: 'specifications',
              type: 'jsonb',
              isNullable: true,
            },
            {
              name: 'tags',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'isVisible',
              type: 'boolean',
              default: true,
            },
            {
              name: 'isFeatured',
              type: 'boolean',
              default: false,
            },
            {
              name: 'sortOrder',
              type: 'integer',
              default: 0,
            },
            {
              name: 'isActive',
              type: 'boolean',
              default: true,
            },
            {
              name: 'isDeleted',
              type: 'boolean',
              default: false,
            },
            {
              name: 'createdBy',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'updatedBy',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'deletedBy',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'createdAt',
              type: 'timestamptz',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updatedAt',
              type: 'timestamptz',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'deletedAt',
              type: 'timestamptz',
              isNullable: true,
            },
          ],
          indices: [
            {
              name: 'IDX_PRODUCTS_SKU',
              columnNames: ['sku'],
            },
            {
              name: 'IDX_PRODUCTS_TYPE',
              columnNames: ['type'],
            },
            {
              name: 'IDX_PRODUCTS_STATUS',
              columnNames: ['status'],
            },
            {
              name: 'IDX_PRODUCTS_PARENT',
              columnNames: ['parentId'],
            },
            {
              name: 'IDX_PRODUCTS_ACTIVE',
              columnNames: ['isActive'],
            },
            {
              name: 'IDX_PRODUCTS_DELETED',
              columnNames: ['isDeleted'],
            },
          ],
        }),
        true,
      );

      // Add self-referencing foreign key for parent relationship
      await queryRunner.query(
        `ALTER TABLE "products" ADD CONSTRAINT "FK_products_parent" FOREIGN KEY ("parentId") REFERENCES "products"("id") ON DELETE SET NULL`,
      );
    }

    // Create product_categories junction table if it doesn't exist
    const productCategoriesExists = await queryRunner.hasTable('product_categories');
    if (!productCategoriesExists) {
      await queryRunner.createTable(
        new Table({
          name: 'product_categories',
          columns: [
            {
              name: 'productId',
              type: 'uuid',
              isPrimary: true,
            },
            {
              name: 'categoryId',
              type: 'uuid',
              isPrimary: true,
            },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_parent"`);
    
    // Drop tables
    await queryRunner.dropTable('product_categories', true);
    await queryRunner.dropTable('products', true);
  }
}
