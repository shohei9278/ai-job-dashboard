import { Controller, Get, Query, BadRequestException,Header } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { FindJobsQueryDto } from './dto/find-jobs-query.dto';
import { log } from 'node:console';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }
  
  @Header('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600')
  @Get()
  async getJobs(@Query() query: FindJobsQueryDto) {
    try {
      return await this.jobsService.findJobs(query);
    } catch (err) {
      console.error('GET /jobs error:', err);
      throw new BadRequestException(err.message);
    }
  }
}
