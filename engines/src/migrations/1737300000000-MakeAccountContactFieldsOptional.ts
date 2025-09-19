import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeAccountContactFieldsOptional1737300000000 implements MigrationInterface {
  name = 'MakeAccountContactFieldsOptional1737300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make primaryPhone nullable
    await queryRunner.query(`
      ALTER TABLE "accounts" 
      ALTER COLUMN "primaryPhone" DROP NOT NULL
    `);

    // Make primaryEmail nullable
    await queryRunner.query(`
      ALTER TABLE "accounts" 
      ALTER COLUMN "primaryEmail" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert primaryPhone to NOT NULL (will fail if there are NULL values)
    await queryRunner.query(`
      ALTER TABLE "accounts" 
      ALTER COLUMN "primaryPhone" SET NOT NULL
    `);

    // Revert primaryEmail to NOT NULL (will fail if there are NULL values)
    await queryRunner.query(`
      ALTER TABLE "accounts" 
      ALTER COLUMN "primaryEmail" SET NOT NULL
    `);
  }
}
