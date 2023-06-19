import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectAndUserAndProjectRole } from '../../db/entity/index';
import { ProjectRole } from '../../db/entity/project-role.entity';
import { ProjectAndTeamAndProjectRole } from '../../db/entity/relations/project-and-team-and-project-role.entity';
import { ProjectRoleController } from './project-role.controller';
import { ProjectRoleService } from './project-role.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectAndUserAndProjectRole, ProjectAndTeamAndProjectRole, ProjectRole])],
  controllers: [ProjectRoleController],
  providers: [ProjectRoleService],
})
export class ProjectRoleModule {}
