import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';

@Module({
  imports: [],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {}
