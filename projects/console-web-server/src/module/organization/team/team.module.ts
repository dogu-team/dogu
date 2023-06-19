import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationAndUserAndTeam, Team, User } from '../../../db/entity/index';
import { ProjectAndTeamAndProjectRole } from '../../../db/entity/relations/project-and-team-and-project-role.entity';
import { GitlabModule } from '../../gitlab/gitlab.module';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationAndUserAndTeam, ProjectAndTeamAndProjectRole, User, Team]), GitlabModule],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
