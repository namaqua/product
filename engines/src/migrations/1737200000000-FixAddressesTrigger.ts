import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAddressesTrigger1737200000000 implements MigrationInterface {
  name = 'FixAddressesTrigger1737200000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First check if addresses table exists
    const tableExists = await queryRunner.hasTable('addresses');
    
    if (tableExists) {
      // Drop any existing trigger with incorrect column names
      await queryRunner.query(`DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;`);
      await queryRunner.query(`DROP FUNCTION IF EXISTS update_addresses_updated_at() CASCADE;`);
      
      // Create the correct trigger function for camelCase columns
      await queryRunner.query(`
        CREATE OR REPLACE FUNCTION update_addresses_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW."updatedAt" = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Create the trigger
      await queryRunner.query(`
        CREATE TRIGGER update_addresses_updated_at
        BEFORE UPDATE ON addresses
        FOR EACH ROW
        EXECUTE FUNCTION update_addresses_updated_at();
      `);
      
      console.log('Fixed addresses table trigger to use camelCase columns');
    } else {
      console.log('Addresses table does not exist yet, skipping trigger fix');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the trigger and function
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_addresses_updated_at() CASCADE;`);
  }
}
