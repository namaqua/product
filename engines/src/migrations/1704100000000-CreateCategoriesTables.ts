import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCategoriesTables1704100000000 implements MigrationInterface {
  name = 'CreateCategoriesTables1704100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create categories table
    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'parentId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'path',
            type: 'varchar',
            length: '1000',
            isNullable: true,
          },
          {
            name: 'level',
            type: 'integer',
            default: 0,
          },
          {
            name: 'left',
            type: 'integer',
            default: 0,
          },
          {
            name: 'right',
            type: 'integer',
            default: 0,
          },
          {
            name: 'sortOrder',
            type: 'integer',
            default: 0,
          },
          {
            name: 'isVisible',
            type: 'boolean',
            default: true,
          },
          {
            name: 'showInMenu',
            type: 'boolean',
            default: true,
          },
          {
            name: 'isFeatured',
            type: 'boolean',
            default: false,
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
            name: 'imageUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'bannerUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'defaultAttributes',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'requiredAttributes',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'integer',
            default: 1,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
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
            name: 'IDX_CATEGORIES_SLUG',
            columnNames: ['slug'],
          },
          {
            name: 'IDX_CATEGORIES_PARENT',
            columnNames: ['parentId'],
          },
          {
            name: 'IDX_CATEGORIES_LEFT_RIGHT',
            columnNames: ['left', 'right'],
          },
          {
            name: 'IDX_CATEGORIES_LEVEL',
            columnNames: ['level'],
          },
          {
            name: 'IDX_CATEGORIES_PATH',
            columnNames: ['path'],
          },
        ],
      }),
      true,
    );

    // Add foreign key constraint for parent
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_parent" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_parent"`);
    
    // Drop the categories table
    await queryRunner.dropTable('categories', true);
  }
}
