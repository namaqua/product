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
        this.logger.log(`📊 Database: ${this.dataSource.options.database}`);
        this.logger.log(`🏠 Host: ${(this.dataSource.options as any).host}:${(this.dataSource.options as any).port}`);
        this.logger.log(`👤 User: ${(this.dataSource.options as any).username}`);
      }
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }
}
