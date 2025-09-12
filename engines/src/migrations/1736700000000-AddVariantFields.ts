import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVariantFields1736700000000 implements MigrationInterface {
  name = 'AddVariantFields1736700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add variant-specific columns to products table
    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "variantAxes" jsonb DEFAULT NULL
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN "products"."variantAxes" IS 'Attributes that define this variant (e.g., {"color": "blue", "size": "L"})'
    `);

    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "variantAttributes" jsonb DEFAULT NULL
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN "products"."variantAttributes" IS 'List of attributes that can vary (e.g., ["sku", "price", "quantity"])'
    `);

    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "inheritedAttributes" boolean DEFAULT true
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN "products"."inheritedAttributes" IS 'Whether variant inherits attributes from parent'
    `);

    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "variantGroupId" varchar(255) DEFAULT NULL
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN "products"."variantGroupId" IS 'Unique identifier for grouping variants together'
    `);

    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "isConfigurable" boolean DEFAULT false
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN "products"."isConfigurable" IS 'Marks product as a variant parent'
    `);

    // Add indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_variantGroupId" 
      ON "products" ("variantGroupId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_isConfigurable" 
      ON "products" ("isConfigurable")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_variantAxes" 
      ON "products" USING GIN ("variantAxes")
    `);

    // Update existing configurable products
    await queryRunner.query(`
      UPDATE "products" 
      SET "isConfigurable" = true 
      WHERE "type" = 'configurable' AND "parentId" IS NULL
    `);

    // Set variantGroupId for existing variants
    await queryRunner.query(`
      UPDATE "products" p1
      SET "variantGroupId" = p2.id
      FROM "products" p2
      WHERE p1."parentId" = p2.id AND p1."parentId" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_variantAxes"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_isConfigurable"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_variantGroupId"`);

    // Drop columns
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "isConfigurable"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "variantGroupId"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "inheritedAttributes"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "variantAttributes"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "variantAxes"`);
  }
}
