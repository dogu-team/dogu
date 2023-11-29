import { OrganizationPropCamel, OrganizationScmRespository, UpdateOrganizationScmDto } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { OrganizationScm } from '../../../db/entity/organization-scm.entity';
import { ORGANIZATION_ROLE } from '../../auth/auth.types';
import { OrganizationPermission } from '../../auth/decorators';
import { OrganizationScmService } from './scm.service';

@Controller('organizations/:organizationId/scm')
export class OrganizationScmController {
  constructor(private readonly organizationScmService: OrganizationScmService) {}

  @Patch()
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async updateOrganizationScm(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Body() dto: UpdateOrganizationScmDto): Promise<OrganizationScm> {
    return await this.organizationScmService.updateOrganizationScm(organizationId, dto);
  }

  @Delete()
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async deleteOrganizationScm(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId): Promise<void> {
    return await this.organizationScmService.deleteOrganizationScm(organizationId);
  }

  @Get('repositories')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findAllRepositories(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId): Promise<OrganizationScmRespository[]> {
    return await this.organizationScmService.findAllRepositories(organizationId);
  }
}
