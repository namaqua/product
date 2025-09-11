import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAttributesTables1704200000000 implements MigrationInterface {
  name = 'CreateAttributesTables1704200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create attribute_groups table
    await queryRunner.createTable(
      new Table({
        name: 'attribute_groups',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'code',
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
            name: 'sortOrder',
            type: 'integer',
            default: 0,
          },
          {
            name: 'isSystem',
            type: 'boolean',
            default: false,
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
            name: 'IDX_ATTRIBUTE_GROUPS_CODE',
            columnNames: ['code'],
          },
        ],
      }),
      true,
    );

    // Create attributes table
    await queryRunner.createTable(
      new Table({
        name: 'attributes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'code',
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
            name: 'type',
            type: 'enum',
            enum: ['text', 'number', 'boolean', 'date', 'datetime', 'select', 'multiselect', 'color', 'image', 'file', 'price', 'weight', 'dimension'],
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'groupId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'isRequired',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isUnique',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isFilterable',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isSearchable',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isSortable',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isVisible',
            type: 'boolean',
            default: true,
          },
          {
            name: 'isSystem',
            type: 'boolean',
            default: false,
          },
          {
            name: 'defaultValue',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'validation',
            type: 'jsonb',
            isNullable: true,
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
            name: 'IDX_ATTRIBUTES_CODE',
            columnNames: ['code'],
          },
          {
            name: 'IDX_ATTRIBUTES_TYPE',
            columnNames: ['type'],
          },
          {
            name: 'IDX_ATTRIBUTES_GROUP',
            columnNames: ['groupId'],
          },
        ],
      }),
      true,
    );

    // Create attribute_options table
    await queryRunner.createTable(
      new Table({
        name: 'attribute_options',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'attributeId',
            type: 'uuid',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'label',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'value',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'color',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '100',
            isNullable: true,
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
            name: 'metadata',
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
            name: 'UQ_ATTRIBUTE_OPTION',
            columnNames: ['attributeId', 'code'],
          },
        ],
        indices: [
          {
            name: 'IDX_ATTRIBUTE_OPTIONS_ATTRIBUTE',
            columnNames: ['attributeId'],
          },
        ],
      }),
      true,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "attributes" ADD CONSTRAINT "FK_attributes_group" FOREIGN KEY ("groupId") REFERENCES "attribute_groups"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "attribute_options" ADD CONSTRAINT "FK_attribute_options_attribute" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "attribute_options" DROP CONSTRAINT "FK_attribute_options_attribute"`);
    await queryRunner.query(`ALTER TABLE "attributes" DROP CONSTRAINT "FK_attributes_group"`);
    
    // Drop tables
    await queryRunner.dropTable('attribute_options', true);
    await queryRunner.dropTable('attributes', true);
    await queryRunner.dropTable('attribute_groups', true);
  }
}
