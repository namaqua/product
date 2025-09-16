import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVersionColumns1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add version columns with default value
        const tables = ['categories', 'products', 'users', 'media', 'attributes', 'variants'];
        
        for (const table of tables) {
            // Check if table exists
            const tableExists = await queryRunner.hasTable(table);
            if (tableExists) {
                // Check if column exists
                const hasColumn = await queryRunner.hasColumn(table, 'version');
                if (!hasColumn) {
                    await queryRunner.query(`
                        ALTER TABLE "${table}" 
                        ADD COLUMN "version" integer DEFAULT 1 NOT NULL
                    `);
                }
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tables = ['categories', 'products', 'users', 'media', 'attributes', 'variants'];
        
        for (const table of tables) {
            const tableExists = await queryRunner.hasTable(table);
            if (tableExists) {
                const hasColumn = await queryRunner.hasColumn(table, 'version');
                if (hasColumn) {
                    await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "version"`);
                }
            }
        }
    }
}
