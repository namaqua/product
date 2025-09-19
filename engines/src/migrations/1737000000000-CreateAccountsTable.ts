import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAccountsTable1737000000000 implements MigrationInterface {
  name = 'CreateAccountsTable1737000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create accounts table
    await queryRunner.createTable(
      new Table({
        name: 'accounts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'legalName',
            type: 'varchar',
            length: '255',
            comment: 'Official registered business name',
          },
          {
            name: 'tradeName',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Trading name / DBA (doing business as)',
          },
          {
            name: 'registrationNumber',
            type: 'varchar',
            length: '100',
            isUnique: true,
            comment: 'Business registration number',
          },
          {
            name: 'taxId',
            type: 'varchar',
            length: '50',
            isUnique: true,
            comment: 'Tax/VAT identification number',
          },
          {
            name: 'accountType',
            type: 'enum',
            enum: ['customer', 'partner', 'supplier', 'prospect', 'vendor', 'distributor', 'manufacturer', 'other'],
            default: "'customer'",
            comment: 'Type of business account',
          },
          {
            name: 'industry',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Industry or business sector',
          },
          {
            name: 'subIndustry',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Sub-industry classification',
          },
          {
            name: 'businessSize',
            type: 'enum',
            enum: ['startup', 'smb', 'mid_market', 'enterprise'],
            isNullable: true,
            comment: 'Business size classification',
          },
          {
            name: 'ownershipType',
            type: 'enum',
            enum: ['public', 'private', 'government', 'nonprofit', 'partnership', 'sole_proprietorship'],
            isNullable: true,
            comment: 'Type of business ownership',
          },
          {
            name: 'headquartersAddress',
            type: 'jsonb',
            comment: 'Headquarters address',
          },
          {
            name: 'billingAddress',
            type: 'jsonb',
            isNullable: true,
            comment: 'Billing address',
          },
          {
            name: 'shippingAddress',
            type: 'jsonb',
            isNullable: true,
            comment: 'Shipping address',
          },
          {
            name: 'primaryPhone',
            type: 'varchar',
            length: '20',
            comment: 'Primary phone number',
          },
          {
            name: 'primaryEmail',
            type: 'varchar',
            length: '255',
            comment: 'Primary email address',
          },
          {
            name: 'websiteUrl',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Company website URL',
          },
          {
            name: 'parentAccountId',
            type: 'uuid',
            isNullable: true,
            comment: 'Parent account ID (if subsidiary)',
          },
          {
            name: 'preferredCurrency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
            comment: 'Preferred currency code',
          },
          {
            name: 'paymentTerms',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Payment terms',
          },
          {
            name: 'creditLimit',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
            comment: 'Credit limit amount',
          },
          {
            name: 'creditStatus',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Credit status',
          },
          {
            name: 'discountLevel',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Discount level or price tier',
          },
          {
            name: 'contractReferences',
            type: 'jsonb',
            isNullable: true,
            comment: 'Contract reference numbers',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'pending_verification', 'blacklisted', 'suspended'],
            default: "'pending_verification'",
            comment: 'Account status',
          },
          {
            name: 'verificationStatus',
            type: 'enum',
            enum: ['pending', 'verified', 'rejected', 'documents_required'],
            default: "'pending'",
            comment: 'Document verification status',
          },
          {
            name: 'onboardingDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Date when account was onboarded',
          },
          {
            name: 'lastActivityDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Last activity date',
          },
          {
            name: 'recordOwnerId',
            type: 'uuid',
            isNullable: true,
            comment: 'CRM User ID who owns this record',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex('accounts', new TableIndex({
      name: 'IDX_ACCOUNT_LEGAL_NAME',
      columnNames: ['legalName'],
    }));

    await queryRunner.createIndex('accounts', new TableIndex({
      name: 'IDX_ACCOUNT_TRADE_NAME',
      columnNames: ['tradeName'],
    }));

    await queryRunner.createIndex('accounts', new TableIndex({
      name: 'IDX_ACCOUNT_STATUS',
      columnNames: ['status'],
    }));

    await queryRunner.createIndex('accounts', new TableIndex({
      name: 'IDX_ACCOUNT_TYPE',
      columnNames: ['accountType'],
    }));

    await queryRunner.createIndex('accounts', new TableIndex({
      name: 'IDX_ACCOUNT_VERIFICATION',
      columnNames: ['verificationStatus'],
    }));

    // Create foreign keys (check if they exist first)
    const accountsTable = await queryRunner.getTable('accounts');
    
    // Check if parentAccountId foreign key exists
    const parentFKExists = accountsTable?.foreignKeys.some(
      fk => fk.columnNames.includes('parentAccountId')
    );
    
    if (!parentFKExists) {
      await queryRunner.createForeignKey(
        'accounts',
        new TableForeignKey({
          columnNames: ['parentAccountId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'accounts',
          onDelete: 'SET NULL',
        }),
      );
    }

    // Check if recordOwnerId foreign key exists
    const recordOwnerFKExists = accountsTable?.foreignKeys.some(
      fk => fk.columnNames.includes('recordOwnerId')
    );
    
    if (!recordOwnerFKExists) {
      await queryRunner.createForeignKey(
        'accounts',
        new TableForeignKey({
          columnNames: ['recordOwnerId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'SET NULL',
        }),
      );
    }

    // Create junction table for account-users many-to-many relationship
    await queryRunner.createTable(
      new Table({
        name: 'account_users',
        columns: [
          {
            name: 'account_id',
            type: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    // Add primary key
    await queryRunner.createPrimaryKey('account_users', ['account_id', 'user_id']);

    // Add foreign keys for junction table
    await queryRunner.createForeignKey(
      'account_users',
      new TableForeignKey({
        columnNames: ['account_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'accounts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'account_users',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create junction table for account-documents many-to-many relationship
    await queryRunner.createTable(
      new Table({
        name: 'account_documents',
        columns: [
          {
            name: 'account_id',
            type: 'uuid',
          },
          {
            name: 'media_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    // Add primary key
    await queryRunner.createPrimaryKey('account_documents', ['account_id', 'media_id']);

    // Add foreign keys for junction table
    await queryRunner.createForeignKey(
      'account_documents',
      new TableForeignKey({
        columnNames: ['account_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'accounts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'account_documents',
      new TableForeignKey({
        columnNames: ['media_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'media',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop junction tables first
    await queryRunner.dropTable('account_documents');
    await queryRunner.dropTable('account_users');

    // Drop accounts table
    await queryRunner.dropTable('accounts');
  }
}
