import { Controller } from '@nestjs/common';
import { JobService } from './job.service';

@Controller('job')
export class JobController {
  constructor(private jobService: JobService) {}
}
