import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceMediaLibrary1734000000000 implements MigrationInterface {
  name = 'EnhanceMediaLibrary1734000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if thumbnails column exists, if not add it
    const hasThumbsColumn = await queryRunner.hasColumn('media', 'thumbnails');
    if (!hasThumbsColumn) {
      await queryRunner.query(`
        ALTER TABLE "media" 
        ADD COLUMN "thumbnails" jsonb NULL
      `);
      await queryRunner.query(`
        COMMENT ON COLUMN "media"."thumbnails" IS 'Thumbnail versions with different sizes'
      `);
    }

    // Check if metadata column exists, if not add it
    const hasMetadataColumn = await queryRunner.hasColumn('media', 'metadata');
    if (!hasMetadataColumn) {
      await queryRunner.query(`
        ALTER TABLE "media" 
        ADD COLUMN "metadata" jsonb NULL
      `);
      await queryRunner.query(`
        COMMENT ON COLUMN "media"."metadata" IS 'Additional metadata (EXIF, etc.)'
      `);
    }

    // Check if width column exists, if not add it
    const hasWidthColumn = await queryRunner.hasColumn('media', 'width');
    if (!hasWidthColumn) {
      await queryRunner.query(`
        ALTER TABLE "media" 
        ADD COLUMN "width" integer NULL
      `);
      await queryRunner.query(`
        COMMENT ON COLUMN "media"."width" IS 'Image width in pixels'
      `);
    }

    // Check if height column exists, if not add it
    const hasHeightColumn = await queryRunner.hasColumn('media', 'height');
    if (!hasHeightColumn) {
      await queryRunner.query(`
        ALTER TABLE "media" 
        ADD COLUMN "height" integer NULL
      `);
      await queryRunner.query(`
        COMMENT ON COLUMN "media"."height" IS 'Image height in pixels'
      `);
    }

    // Check if duration column exists, if not add it
    const hasDurationColumn = await queryRunner.hasColumn('media', 'duration');
    if (!hasDurationColumn) {
      await queryRunner.query(`
        ALTER TABLE "media" 
        ADD COLUMN "duration" integer NULL
      `);
      await queryRunner.query(`
        COMMENT ON COLUMN "media"."duration" IS 'Video/audio duration in seconds'
      `);
    }

    // Check if isPrimary column exists, if not add it
    const hasIsPrimaryColumn = await queryRunner.hasColumn('media', 'isPrimary');
    if (!hasIsPrimaryColumn) {
      await queryRunner.query(`
        ALTER TABLE "media" 
        ADD COLUMN "isPrimary" boolean DEFAULT false
      `);
      await queryRunner.query(`
        COMMENT ON COLUMN "media"."isPrimary" IS 'Is this the primary media for products'
      `);
    }

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_media_type" ON "media" ("type")
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_media_mimeType" ON "media" ("mimeType")
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_media_isPrimary" ON "media" ("isPrimary")
    `);

    // Create GIN index for JSONB columns for better query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_media_thumbnails" ON "media" USING GIN ("thumbnails")
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_media_metadata" ON "media" USING GIN ("metadata")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_metadata"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_thumbnails"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_isPrimary"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_mimeType"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_type"`);

    // Note: We're not dropping the columns in the down migration
    // as this could result in data loss. If you want to fully revert,
    // uncomment the following lines:
    
    // await queryRunner.query(`ALTER TABLE "media" DROP COLUMN IF EXISTS "isPrimary"`);
    // await queryRunner.query(`ALTER TABLE "media" DROP COLUMN IF EXISTS "duration"`);
    // await queryRunner.query(`ALTER TABLE "media" DROP COLUMN IF EXISTS "height"`);
    // await queryRunner.query(`ALTER TABLE "media" DROP COLUMN IF EXISTS "width"`);
    // await queryRunner.query(`ALTER TABLE "media" DROP COLUMN IF EXISTS "metadata"`);
    // await queryRunner.query(`ALTER TABLE "media" DROP COLUMN IF EXISTS "thumbnails"`);
  }
}
