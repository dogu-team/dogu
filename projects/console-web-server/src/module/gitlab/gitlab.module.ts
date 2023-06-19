import { Module } from '@nestjs/common';
import { GitlabService } from './gitlab.service';

@Module({
  providers: [GitlabService],
  exports: [GitlabService],
})
export class GitlabModule {}
