import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddVariantTemplates1736800000000 implements MigrationInterface {
  name = 'AddVariantTemplates1736800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table already exists
    const tableExists = await queryRunner.hasTable('variant_templates');
    if (tableExists) {
      console.log('Table variant_templates already exists, skipping creation');
      return;
    }

    // Create variant_templates table
    await queryRunner.createTable(
      new Table({
        name: 'variant_templates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'axisName',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'values',
            type: 'json',
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'isGlobal',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'usageCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updatedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_variant_templates_createdBy_isGlobal',
            columnNames: ['createdBy', 'isGlobal'],
          },
          {
            name: 'IDX_variant_templates_name',
            columnNames: ['name'],
          },
        ],
      }),
      true,
    );

    // Add foreign key to users table if it exists
    const hasUsersTable = await queryRunner.hasTable('users');
    if (hasUsersTable) {
      await queryRunner.query(`
        ALTER TABLE "variant_templates"
        ADD CONSTRAINT "FK_variant_templates_createdBy"
        FOREIGN KEY ("createdBy")
        REFERENCES "users"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key if exists
    const table = await queryRunner.getTable('variant_templates');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('createdBy') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('variant_templates', foreignKey);
      }
    }

    // Drop table (this will also drop the indices)
    await queryRunner.dropTable('variant_templates');
  }
}
