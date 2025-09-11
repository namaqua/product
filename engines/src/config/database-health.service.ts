import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseHealthService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      if (this.dataSource.isInitialized) {
        this.logger.log('✅ Database connection established successfully');

        // Run a simple query to verify connection
        const result = await this.dataSource.query('SELECT NOW()');
        this.logger.log(`📅 Database server time: ${result[0].now}`);

        // Log database info
        const options = this.dataSource.options as {
          database?: string;
          host?: string;
          port?: number;
          username?: string;
        };
        this.logger.log(`📊 Database: ${options.database}`);
        this.logger.log(`🏠 Host: ${options.host}:${options.port}`);
        this.logger.log(`👤 User: ${options.username}`);
      }
    } catch (error) {
      this.logger.error(
        '❌ Database connection failed:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error(
        'Database health check failed:',
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }
}
