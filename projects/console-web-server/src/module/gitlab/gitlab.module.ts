import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GitlabRepositoryAuth } from '../../db/entity/gitlab-repository-auth.entity';
import { ProjectRepository } from '../../db/entity/project-repository';
import { GitlabService } from './gitlab.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectRepository, GitlabRepositoryAuth])],
  providers: [GitlabService],
  exports: [GitlabService],
})
export class GitlabModule {}
