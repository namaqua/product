import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAddressesTables1737100000000 implements MigrationInterface {
  name = 'CreateAddressesTables1737100000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create addresses table
    await queryRunner.createTable(
      new Table({
        name: 'addresses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'accountId',
            type: 'uuid',
            isNullable: false,
            comment: 'Account this address belongs to',
          },
          {
            name: 'addressType',
            type: 'enum',
            enum: ['headquarters', 'billing', 'shipping'],
            isNullable: false,
            comment: 'Type of address (headquarters, billing, or shipping)',
          },
          {
            name: 'isDefault',
            type: 'boolean',
            default: false,
            comment: 'Is this the default address for its type (only relevant for shipping)',
          },
          {
            name: 'label',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Custom label for this address (e.g., "Warehouse 1", "East Coast")',
          },
          {
            name: 'contactName',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Name of contact person at this address',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: 'Phone number for this address',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Email for this address',
          },
          {
            name: 'street1',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Street address line 1',
          },
          {
            name: 'street2',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Street address line 2 (apartment, suite, unit, etc.)',
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'City',
          },
          {
            name: 'state',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'State, Province, or Region',
          },
          {
            name: 'postalCode',
            type: 'varchar',
            length: '20',
            isNullable: false,
            comment: 'Postal or ZIP code',
          },
          {
            name: 'country',
            type: 'varchar',
            length: '2',
            isNullable: false,
            comment: 'ISO 3166-1 alpha-2 country code',
          },
          {
            name: 'county',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'County or district',
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
            comment: 'Latitude coordinate',
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
            comment: 'Longitude coordinate',
          },
          {
            name: 'deliveryInstructions',
            type: 'text',
            isNullable: true,
            comment: 'Special delivery or access instructions',
          },
          {
            name: 'businessHours',
            type: 'jsonb',
            isNullable: true,
            comment: 'Business hours for this location',
          },
          {
            name: 'isValidated',
            type: 'boolean',
            default: false,
            comment: 'Has this address been validated',
          },
          {
            name: 'validatedAt',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'When the address was last validated',
          },
          {
            name: 'validationDetails',
            type: 'jsonb',
            isNullable: true,
            comment: 'Validation details from address validation service',
          },
          {
            name: 'lastUsedAt',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Last time this address was used',
          },
          {
            name: 'usageCount',
            type: 'integer',
            default: 0,
            comment: 'Number of times this address has been used',
          },
          // Base entity columns
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            comment: 'Record creation timestamp',
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            comment: 'Record last update timestamp',
          },
          {
            name: 'createdBy',
            type: 'uuid',
            isNullable: true,
            comment: 'User ID who created this record',
          },
          {
            name: 'updatedBy',
            type: 'uuid',
            isNullable: true,
            comment: 'User ID who last updated this record',
          },
          {
            name: 'version',
            type: 'integer',
            default: 1,
            comment: 'Version number for optimistic locking',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            comment: 'Flag to indicate if record is active',
          },
        ],
      }),
      true, // ifNotExists
    );

    // Create indexes
    await queryRunner.createIndex(
      'addresses',
      new TableIndex({
        name: 'IDX_addresses_account_type',
        columnNames: ['accountId', 'addressType'],
      })
    );

    await queryRunner.createIndex(
      'addresses',
      new TableIndex({
        name: 'IDX_addresses_account_default',
        columnNames: ['accountId', 'isDefault'],
      })
    );

    await queryRunner.createIndex(
      'addresses',
      new TableIndex({
        name: 'IDX_addresses_postal_code',
        columnNames: ['postalCode'],
      })
    );

    await queryRunner.createIndex(
      'addresses',
      new TableIndex({
        name: 'IDX_addresses_city_country',
        columnNames: ['city', 'country'],
      })
    );

    // Add foreign key constraint to accounts table (check if exists first)
    const constraintExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'FK_addresses_account'
      )
    `);
    
    if (!constraintExists[0].exists) {
      await queryRunner.query(`
        ALTER TABLE addresses
        ADD CONSTRAINT FK_addresses_account
        FOREIGN KEY ("accountId") REFERENCES accounts(id)
        ON DELETE CASCADE;
      `);
    }

    // Create trigger to update updatedAt column
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_addresses_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_addresses_updated_at
      BEFORE UPDATE ON addresses
      FOR EACH ROW
      EXECUTE FUNCTION update_addresses_updated_at();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger and function
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_addresses_updated_at();`);

    // Drop foreign key constraint
    await queryRunner.query(`ALTER TABLE addresses DROP CONSTRAINT IF EXISTS FK_addresses_account;`);

    // Drop indexes
    await queryRunner.dropIndex('addresses', 'IDX_addresses_account_type');
    await queryRunner.dropIndex('addresses', 'IDX_addresses_account_default');
    await queryRunner.dropIndex('addresses', 'IDX_addresses_postal_code');
    await queryRunner.dropIndex('addresses', 'IDX_addresses_city_country');

    // Drop table
    await queryRunner.dropTable('addresses');
  }
}
