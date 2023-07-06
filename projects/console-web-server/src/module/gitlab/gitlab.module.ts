import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectScm } from '../../db/entity/project-scm';
import { ProjectScmGithubAuth } from '../../db/entity/project-scm-github-auth.entity';
import { ProjectScmGitlabAuth } from '../../db/entity/project-scm-gitlab-auth.entity';
import { GitlabService } from './gitlab.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectScm, ProjectScmGithubAuth, ProjectScmGitlabAuth])],
  providers: [GitlabService],
  exports: [GitlabService],
})
export class GitlabModule {}
