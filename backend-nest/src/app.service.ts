import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) { }
  
  async getHello() {
     const latestJob = await this.prisma.jobs.findFirst({
      orderBy: { created_at: 'desc' },
    });

    return {
      message: 'API is running',
      latestJob: latestJob || null,
    };
  }
}
