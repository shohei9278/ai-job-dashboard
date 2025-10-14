import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    const now = new Date().toISOString();
    return {
      status: 'ok',
      timestamp: now,
      message: 'API is healthy',
    };
  }
}