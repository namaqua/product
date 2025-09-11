import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseHealthService } from './config/database-health.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseHealthService: DatabaseHealthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async checkHealth() {
    const dbHealthy = await this.databaseHealthService.checkHealth();
    return {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'disconnected',
      service: 'PIM Backend',
      environment: process.env.NODE_ENV,
    };
  }
}
