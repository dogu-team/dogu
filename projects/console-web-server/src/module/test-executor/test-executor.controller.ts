import { TestExecutorBase, TestExecutorWebResponsiveSnapshotMap } from '@dogu-private/console';
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

  @Get('/web-responsive/list')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async getWebResponsiveList(@User() user: UserPayload, @Query() dto: GetWebResponsiveListDto): Promise<TestExecutorBase[]> {
    const webResponsiveList = await this.service.getWebResponsiveList(dto);
    return webResponsiveList;
  }

  @Get('/web-responsive/snapshot')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async getWebResponsiveSnapshots(@User() user: UserPayload, @Query() dto: GetWebResponsiveSnapshotsDto): Promise<TestExecutorWebResponsiveSnapshotMap> {
    const snapshots = await this.service.getWebResponsiveSnapshots(dto);
    return snapshots;
  }

  @Post('/web-responsive/create')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async createWebResponsiveSnapshots(@User() user: UserPayload, @Body() dto: CreateWebResponsiveDto): Promise<void> {
    await this.service.createWebResponsiveSnapshots(user.userId, dto);
  }
}
