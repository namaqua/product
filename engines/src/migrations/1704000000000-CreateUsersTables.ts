import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateUsersTables1704000000000 implements MigrationInterface {
  name = 'CreateUsersTables1704000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'firstName',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'lastName',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'manager', 'editor', 'viewer', 'user'],
            default: "'viewer'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'pending', 'suspended'],
            default: "'active'",
          },
          {
            name: 'phoneNumber',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'department',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'jobTitle',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'lastLoginAt',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'refreshToken',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'resetPasswordToken',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'resetPasswordExpires',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'emailVerified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'emailVerificationToken',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'preferences',
            type: 'jsonb',
            isNullable: true,
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
            name: 'IDX_USERS_EMAIL',
            columnNames: ['email'],
          },
          {
            name: 'IDX_USERS_ROLE',
            columnNames: ['role'],
          },
          {
            name: 'IDX_USERS_STATUS',
            columnNames: ['status'],
          },
          {
            name: 'IDX_USERS_ACTIVE',
            columnNames: ['isActive'],
          },
        ],
      }),
      true,
    );

    // Add comments
    await queryRunner.query(`COMMENT ON COLUMN "users"."email" IS 'User email address'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."password" IS 'Hashed password'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."firstName" IS 'User first name'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."lastName" IS 'User last name'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."role" IS 'User role for authorization'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."status" IS 'User account status'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."phoneNumber" IS 'User phone number'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."department" IS 'User department'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."jobTitle" IS 'User job title'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."lastLoginAt" IS 'Last login timestamp'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."refreshToken" IS 'Refresh token for JWT'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."resetPasswordToken" IS 'Password reset token'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."resetPasswordExpires" IS 'Password reset token expiry'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."emailVerified" IS 'Email verification status'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."emailVerificationToken" IS 'Email verification token'`);
    await queryRunner.query(`COMMENT ON COLUMN "users"."preferences" IS 'User preferences and settings'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the users table
    await queryRunner.dropTable('users', true);
  }
}
