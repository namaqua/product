import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateImportExportTables1734000000000 implements MigrationInterface {
  name = 'CreateImportExportTables1734000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create import_jobs table
    await queryRunner.createTable(
      new Table({
        name: 'import_jobs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'filename',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'original_filename',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'filepath',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'mapping',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'options',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'total_rows',
            type: 'integer',
            default: 0,
          },
          {
            name: 'processed_rows',
            type: 'integer',
            default: 0,
          },
          {
            name: 'success_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'error_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'skip_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'errors',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'summary',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'started_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_import_jobs_status',
            columnNames: ['status'],
          },
          {
            name: 'IDX_import_jobs_type',
            columnNames: ['type'],
          },
          {
            name: 'IDX_import_jobs_user_id',
            columnNames: ['user_id'],
          },
        ],
      }),
      true,
    );

    // Create export_jobs table
    await queryRunner.createTable(
      new Table({
        name: 'export_jobs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'format',
            type: 'varchar',
            length: '50',
            default: "'csv'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'filename',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'filepath',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'download_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'filters',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'fields',
            type: 'text',
            isNullable: true,
            comment: 'JSON array stored as text',
          },
          {
            name: 'options',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'total_records',
            type: 'integer',
            default: 0,
          },
          {
            name: 'processed_records',
            type: 'integer',
            default: 0,
          },
          {
            name: 'file_size',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'started_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_export_jobs_status',
            columnNames: ['status'],
          },
          {
            name: 'IDX_export_jobs_type',
            columnNames: ['type'],
          },
          {
            name: 'IDX_export_jobs_user_id',
            columnNames: ['user_id'],
          },
        ],
      }),
      true,
    );

    // Create import_mappings table
    await queryRunner.createTable(
      new Table({
        name: 'import_mappings',
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
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'mapping',
            type: 'jsonb',
          },
          {
            name: 'transformations',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'defaults',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'validation',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'usage_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'last_used_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_import_mappings_type',
            columnNames: ['type'],
          },
          {
            name: 'IDX_import_mappings_user_id',
            columnNames: ['user_id'],
          },
          {
            name: 'IDX_import_mappings_is_default',
            columnNames: ['is_default'],
          },
        ],
      }),
      true,
    );

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE import_jobs 
      ADD CONSTRAINT FK_import_jobs_user 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE export_jobs 
      ADD CONSTRAINT FK_export_jobs_user 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE import_mappings 
      ADD CONSTRAINT FK_import_mappings_user 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE import_jobs DROP CONSTRAINT IF EXISTS FK_import_jobs_user`);
    await queryRunner.query(`ALTER TABLE export_jobs DROP CONSTRAINT IF EXISTS FK_export_jobs_user`);
    await queryRunner.query(`ALTER TABLE import_mappings DROP CONSTRAINT IF EXISTS FK_import_mappings_user`);

    // Drop tables
    await queryRunner.dropTable('import_mappings');
    await queryRunner.dropTable('export_jobs');
    await queryRunner.dropTable('import_jobs');
  }
}
