import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateProductTables1705000000000 implements MigrationInterface {
  name = 'CreateProductTables1705000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
            name: 'quantity',
            type: 'integer',
            default: 0,
          },
          {
            name: 'trackInventory',
            type: 'boolean',
            default: true,
          },
          {
            name: 'inStock',
            type: 'boolean',
            default: true,
          },
          {
            name: 'minQuantity',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'maxQuantity',
            type: 'integer',
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
            name: 'comparePrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'costPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
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
            name: 'weightUnit',
            type: 'varchar',
            length: '10',
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
            name: 'dimensionUnit',
            type: 'varchar',
            length: '10',
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
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'customFields',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'integer',
            default: 1,
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
          {
            name: 'createdById',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updatedById',
            type: 'uuid',
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
        ],
      }),
      true,
    );

    // Create product_locales table
    await queryRunner.createTable(
      new Table({
        name: 'product_locales',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'productId',
            type: 'uuid',
          },
          {
            name: 'localeCode',
            type: 'varchar',
            length: '10',
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
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        uniques: [
          {
            name: 'UQ_PRODUCT_LOCALE',
            columnNames: ['productId', 'localeCode'],
          },
        ],
        indices: [
          {
            name: 'IDX_PRODUCT_LOCALES_PRODUCT',
            columnNames: ['productId'],
          },
          {
            name: 'IDX_PRODUCT_LOCALES_LOCALE',
            columnNames: ['localeCode'],
          },
        ],
      }),
      true,
    );

    // Create product_variants table
    await queryRunner.createTable(
      new Table({
        name: 'product_variants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'parentProductId',
            type: 'uuid',
          },
          {
            name: 'variantProductId',
            type: 'uuid',
          },
          {
            name: 'variantAttributes',
            type: 'jsonb',
          },
          {
            name: 'priceModifier',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'weightModifier',
            type: 'decimal',
            precision: 10,
            scale: 3,
            default: 0,
          },
          {
            name: 'isDefault',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sortOrder',
            type: 'integer',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        uniques: [
          {
            name: 'UQ_PRODUCT_VARIANT',
            columnNames: ['parentProductId', 'variantProductId'],
          },
        ],
        indices: [
          {
            name: 'IDX_VARIANTS_PARENT',
            columnNames: ['parentProductId'],
          },
          {
            name: 'IDX_VARIANTS_VARIANT',
            columnNames: ['variantProductId'],
          },
        ],
      }),
      true,
    );

    // Create product_bundles table
    await queryRunner.createTable(
      new Table({
        name: 'product_bundles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'bundleProductId',
            type: 'uuid',
          },
          {
            name: 'componentProductId',
            type: 'uuid',
          },
          {
            name: 'quantity',
            type: 'integer',
            default: 1,
          },
          {
            name: 'isRequired',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sortOrder',
            type: 'integer',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        uniques: [
          {
            name: 'UQ_PRODUCT_BUNDLE',
            columnNames: ['bundleProductId', 'componentProductId'],
          },
        ],
        indices: [
          {
            name: 'IDX_BUNDLES_BUNDLE',
            columnNames: ['bundleProductId'],
          },
          {
            name: 'IDX_BUNDLES_COMPONENT',
            columnNames: ['componentProductId'],
          },
        ],
      }),
      true,
    );

    // Create product_relationships table
    await queryRunner.createTable(
      new Table({
        name: 'product_relationships',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'sourceProductId',
            type: 'uuid',
          },
          {
            name: 'targetProductId',
            type: 'uuid',
          },
          {
            name: 'relationshipType',
            type: 'enum',
            enum: ['cross_sell', 'up_sell', 'related', 'accessory'],
          },
          {
            name: 'sortOrder',
            type: 'integer',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        uniques: [
          {
            name: 'UQ_PRODUCT_RELATIONSHIP',
            columnNames: ['sourceProductId', 'targetProductId', 'relationshipType'],
          },
        ],
        indices: [
          {
            name: 'IDX_RELATIONSHIPS_SOURCE',
            columnNames: ['sourceProductId'],
          },
          {
            name: 'IDX_RELATIONSHIPS_TARGET',
            columnNames: ['targetProductId'],
          },
          {
            name: 'IDX_RELATIONSHIPS_TYPE',
            columnNames: ['relationshipType'],
          },
        ],
      }),
      true,
    );

    // Create product_attributes table
    await queryRunner.createTable(
      new Table({
        name: 'product_attributes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'productId',
            type: 'uuid',
          },
          {
            name: 'attributeCode',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'valueText',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'valueNumber',
            type: 'decimal',
            precision: 20,
            scale: 6,
            isNullable: true,
          },
          {
            name: 'valueBoolean',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'valueDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'valueDatetime',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'valueJson',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'valueOptions',
            type: 'uuid',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'localeCode',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'channelCode',
            type: 'varchar',
            length: '50',
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
        ],
        uniques: [
          {
            name: 'UQ_PRODUCT_ATTRIBUTE',
            columnNames: ['productId', 'attributeCode', 'localeCode', 'channelCode'],
          },
        ],
        indices: [
          {
            name: 'IDX_PRODUCT_ATTRIBUTES_PRODUCT',
            columnNames: ['productId'],
          },
          {
            name: 'IDX_PRODUCT_ATTRIBUTES_CODE',
            columnNames: ['attributeCode'],
          },
          {
            name: 'IDX_PRODUCT_ATTRIBUTES_LOCALE',
            columnNames: ['localeCode'],
          },
          {
            name: 'IDX_PRODUCT_ATTRIBUTES_CHANNEL',
            columnNames: ['channelCode'],
          },
        ],
      }),
      true,
    );

    // Create product_media table
    await queryRunner.createTable(
      new Table({
        name: 'product_media',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'productId',
            type: 'uuid',
          },
          {
            name: 'url',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'mediaType',
            type: 'enum',
            enum: ['image', 'video', 'document', '360'],
            default: "'image'",
          },
          {
            name: 'isPrimary',
            type: 'boolean',
            default: false,
          },
          {
            name: 'localeCode',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'altText',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'sortOrder',
            type: 'integer',
            default: 0,
          },
          {
            name: 'filename',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'mimeType',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'fileSize',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'width',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'height',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_PRODUCT_MEDIA_PRODUCT',
            columnNames: ['productId'],
          },
          {
            name: 'IDX_PRODUCT_MEDIA_TYPE',
            columnNames: ['mediaType'],
          },
        ],
      }),
      true,
    );

    // Create product_categories table
    await queryRunner.createTable(
      new Table({
        name: 'product_categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'productId',
            type: 'uuid',
          },
          {
            name: 'categoryId',
            type: 'uuid',
          },
          {
            name: 'isPrimary',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sortOrder',
            type: 'integer',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        uniques: [
          {
            name: 'UQ_PRODUCT_CATEGORY',
            columnNames: ['productId', 'categoryId'],
          },
        ],
        indices: [
          {
            name: 'IDX_PRODUCT_CATEGORIES_PRODUCT',
            columnNames: ['productId'],
          },
          {
            name: 'IDX_PRODUCT_CATEGORIES_CATEGORY',
            columnNames: ['categoryId'],
          },
        ],
      }),
      true,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_products_parent" FOREIGN KEY ("parentId") REFERENCES "products"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_products_createdBy" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_products_updatedBy" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_locales" ADD CONSTRAINT "FK_product_locales_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_product_variants_parent" FOREIGN KEY ("parentProductId") REFERENCES "products"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_product_variants_variant" FOREIGN KEY ("variantProductId") REFERENCES "products"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_bundles" ADD CONSTRAINT "FK_product_bundles_bundle" FOREIGN KEY ("bundleProductId") REFERENCES "products"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_bundles" ADD CONSTRAINT "FK_product_bundles_component" FOREIGN KEY ("componentProductId") REFERENCES "products"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_relationships" ADD CONSTRAINT "FK_product_relationships_source" FOREIGN KEY ("sourceProductId") REFERENCES "products"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_relationships" ADD CONSTRAINT "FK_product_relationships_target" FOREIGN KEY ("targetProductId") REFERENCES "products"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_attributes" ADD CONSTRAINT "FK_product_attributes_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_media" ADD CONSTRAINT "FK_product_media_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" ADD CONSTRAINT "FK_product_categories_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "product_categories" DROP CONSTRAINT "FK_product_categories_product"`);
    await queryRunner.query(`ALTER TABLE "product_media" DROP CONSTRAINT "FK_product_media_product"`);
    await queryRunner.query(`ALTER TABLE "product_attributes" DROP CONSTRAINT "FK_product_attributes_product"`);
    await queryRunner.query(`ALTER TABLE "product_relationships" DROP CONSTRAINT "FK_product_relationships_target"`);
    await queryRunner.query(`ALTER TABLE "product_relationships" DROP CONSTRAINT "FK_product_relationships_source"`);
    await queryRunner.query(`ALTER TABLE "product_bundles" DROP CONSTRAINT "FK_product_bundles_component"`);
    await queryRunner.query(`ALTER TABLE "product_bundles" DROP CONSTRAINT "FK_product_bundles_bundle"`);
    await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_product_variants_variant"`);
    await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_product_variants_parent"`);
    await queryRunner.query(`ALTER TABLE "product_locales" DROP CONSTRAINT "FK_product_locales_product"`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_updatedBy"`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_createdBy"`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_parent"`);

    // Drop tables
    await queryRunner.dropTable('product_categories', true);
    await queryRunner.dropTable('product_media', true);
    await queryRunner.dropTable('product_attributes', true);
    await queryRunner.dropTable('product_relationships', true);
    await queryRunner.dropTable('product_bundles', true);
    await queryRunner.dropTable('product_variants', true);
    await queryRunner.dropTable('product_locales', true);
    await queryRunner.dropTable('products', true);
  }
}
