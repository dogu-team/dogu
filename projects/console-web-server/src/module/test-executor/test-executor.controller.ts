import { TestExecutorWebResponsiveSnapshots } from '@dogu-private/console';
import { UserPayload } from '@dogu-private/types';
import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';

import { ORGANIZATION_ROLE } from '../auth/auth.types';
import { OrganizationPermission, User } from '../auth/decorators';
import { CreateWebResponsiveDto, GetWebResponsiveListDto, GetWebResponsiveSnapshotsDto } from './test-executor.dto';
import { TestExecutorService } from './test-executor.service';

@Controller('/test-executor')
export class TestExecutorController {
  constructor(
    @Inject(TestExecutorService)
    private readonly service: TestExecutorService,
  ) {}

  @Get('/web-responsive/snapshot')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async getWebResponsiveSnapshots(@User() user: UserPayload, @Query() dto: GetWebResponsiveSnapshotsDto): Promise<TestExecutorWebResponsiveSnapshots> {
    const snapshots = await this.service.getWebResponsiveSnapshots(dto.organizationId, dto.testExecutorId);
    return snapshots;
  }

  @Get('/web-responsive/list')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async getWebResponsiveList(@User() user: UserPayload, @Query() dto: GetWebResponsiveListDto): Promise<void> {
    const webResponsiveList = await this.service.getWebResponsiveList(dto);
    return webResponsiveList;
  }

  @Post('/web-responsive/create')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async createWebResponsive(@User() user: UserPayload, @Body() dto: CreateWebResponsiveDto): Promise<void> {
    await this.service.createWebResponsive(user.userId, dto);
  }
}
