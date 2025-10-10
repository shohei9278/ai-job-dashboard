import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async getJobs( @Query('q') q?: string,
    @Query('skill') skill?: string,
    @Query('location') location?: string,) {
   try {
      return await this.jobsService.findJobs({ q, skill, location });
    } catch (err) {
      console.error('GET /jobs error:', err);
      throw new BadRequestException(err.message);
    }
  }
}
