import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMediaTables1736604000000 implements MigrationInterface {
    name = 'CreateMediaTables1736604000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if enum already exists before creating
        const enumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'media_type_enum'
            )
        `);
        
        if (!enumExists[0].exists) {
            await queryRunner.query(`
                CREATE TYPE "media_type_enum" AS ENUM('image', 'video', 'document', 'other')
            `);
        }

        // Check if media table already exists
        const mediaTableExists = await queryRunner.hasTable('media');
        
        if (!mediaTableExists) {
            await queryRunner.query(`
                CREATE TABLE "media" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                    "createdBy" uuid,
                    "updatedBy" uuid,
                    "deletedAt" TIMESTAMP WITH TIME ZONE,
                    "deletedBy" uuid,
                    "isDeleted" boolean NOT NULL DEFAULT false,
                    "isActive" boolean NOT NULL DEFAULT true,
                    "version" integer NOT NULL DEFAULT 1,
                    "filename" character varying(255) NOT NULL,
                    "path" character varying(500) NOT NULL,
                    "url" character varying(500),
                    "type" "media_type_enum" NOT NULL DEFAULT 'image',
                    "mimeType" character varying(100) NOT NULL,
                    "size" integer NOT NULL,
                    "alt" character varying(255),
                    "title" character varying(500),
                    "description" text,
                    "width" integer,
                    "height" integer,
                    "duration" integer,
                    "thumbnails" jsonb,
                    "metadata" jsonb,
                    "sortOrder" integer NOT NULL DEFAULT 0,
                    "isPrimary" boolean NOT NULL DEFAULT false,
                    CONSTRAINT "PK_media" PRIMARY KEY ("id")
                )
            `);

            // Create indexes for media table
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_media_filename" ON "media" ("filename")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_media_type" ON "media" ("type")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_media_mimeType" ON "media" ("mimeType")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_media_isDeleted" ON "media" ("isDeleted")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_media_isActive" ON "media" ("isActive")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_media_isPrimary" ON "media" ("isPrimary")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_media_sortOrder" ON "media" ("sortOrder")`);
        }

        // Check if product_media junction table exists
        const productMediaTableExists = await queryRunner.hasTable('product_media');
        
        if (!productMediaTableExists) {
            await queryRunner.query(`
                CREATE TABLE "product_media" (
                    "mediaId" uuid NOT NULL,
                    "productId" uuid NOT NULL,
                    CONSTRAINT "PK_product_media" PRIMARY KEY ("mediaId", "productId")
                )
            `);

            // Create indexes for junction table
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_product_media_mediaId" ON "product_media" ("mediaId")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_product_media_productId" ON "product_media" ("productId")`);

            // Add foreign key constraints
            await queryRunner.query(`
                ALTER TABLE "product_media" 
                ADD CONSTRAINT "FK_product_media_mediaId" 
                FOREIGN KEY ("mediaId") 
                REFERENCES "media"("id") 
                ON DELETE CASCADE ON UPDATE NO ACTION
            `);

            await queryRunner.query(`
                ALTER TABLE "product_media" 
                ADD CONSTRAINT "FK_product_media_productId" 
                FOREIGN KEY ("productId") 
                REFERENCES "products"("id") 
                ON DELETE CASCADE ON UPDATE NO ACTION
            `);
        }

        // Add comments (safe to run multiple times)
        await queryRunner.query(`COMMENT ON TABLE "media" IS 'Stores media files metadata'`);
        await queryRunner.query(`COMMENT ON TABLE "product_media" IS 'Junction table for product-media relationship'`);

        // Add column comments
        await queryRunner.query(`COMMENT ON COLUMN "media"."filename" IS 'Original filename'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."path" IS 'Stored file path'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."url" IS 'Public URL for accessing the file'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."type" IS 'Media type classification'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."mimeType" IS 'MIME type of the file'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."size" IS 'File size in bytes'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."alt" IS 'Alternative text for accessibility'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."title" IS 'Media title'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."description" IS 'Media description'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."width" IS 'Image width in pixels'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."height" IS 'Image height in pixels'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."duration" IS 'Video/audio duration in seconds'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."thumbnails" IS 'Thumbnail versions with different sizes'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."metadata" IS 'Additional metadata (EXIF, etc.)'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."sortOrder" IS 'Sort order for display'`);
        await queryRunner.query(`COMMENT ON COLUMN "media"."isPrimary" IS 'Is this the primary media for products'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "product_media" DROP CONSTRAINT IF EXISTS "FK_product_media_productId"`);
        await queryRunner.query(`ALTER TABLE "product_media" DROP CONSTRAINT IF EXISTS "FK_product_media_mediaId"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_product_media_productId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_product_media_mediaId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_sortOrder"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_isPrimary"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_isActive"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_isDeleted"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_mimeType"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_type"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_filename"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "product_media"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "media"`);

        // Drop enum
        await queryRunner.query(`DROP TYPE IF EXISTS "media_type_enum"`);
    }
}
