import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVariantFields1694567890123 implements MigrationInterface {
  name = 'AddVariantFields1694567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add variant-specific columns to products table
    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "variantAxes" JSONB DEFAULT NULL
    `);
    
    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "variantAttributes" JSONB DEFAULT NULL
    `);
    
    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "inheritedAttributes" BOOLEAN DEFAULT false
    `);
    
    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "variantGroupId" VARCHAR(255) DEFAULT NULL
    `);
    
    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "isConfigurable" BOOLEAN DEFAULT false
    `);
    
    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "parentProductId" VARCHAR(255) DEFAULT NULL
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
      CREATE INDEX IF NOT EXISTS "IDX_products_parentProductId" 
      ON "products" ("parentProductId")
    `);
    
    // Add foreign key constraint for parent-child relationship
    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD CONSTRAINT "FK_products_parentProductId" 
      FOREIGN KEY ("parentProductId") 
      REFERENCES "products"("id") 
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "products" 
      DROP CONSTRAINT IF EXISTS "FK_products_parentProductId"
    `);
    
    // Remove indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_parentProductId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_isConfigurable"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_variantGroupId"`);
    
    // Remove columns
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "parentProductId"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "isConfigurable"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "variantGroupId"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "inheritedAttributes"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "variantAttributes"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "variantAxes"`);
  }
}
