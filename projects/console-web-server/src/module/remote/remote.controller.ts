import { OrganizationPropCamel, ProjectPropCamel, RemoteBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, RemoteId, UserPayload } from '@dogu-private/types';
import { Controller, Get, Param, Query } from '@nestjs/common';

import { PROJECT_ROLE } from '../auth/auth.types';
import { ProjectPermission, User } from '../auth/decorators';
import { Page } from '../common/dto/pagination/page';
import { FindAllRemoteDto } from './dto/remote.dto';
import { RemoteService } from './remote.service';

@Controller('organizations/:organizationId/projects/:projectId/remotes')
export class RemoteController {
  constructor(private readonly remoteService: RemoteService) {}

  @Get('')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findAllRemotes(
    @User() userPayload: UserPayload,
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Query() dto: FindAllRemoteDto,
  ): Promise<Page<RemoteBase>> {
    const rv = await this.remoteService.findAllRemotes(organizationId, projectId, dto);
    return rv;
  }

  @Get(':remoteId')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findRemoteById(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param('remoteId') remoteId: RemoteId,
  ): Promise<RemoteBase> {
    const rv = await this.remoteService.findRemoteById(organizationId, projectId, remoteId);
    return rv;
  }
}
