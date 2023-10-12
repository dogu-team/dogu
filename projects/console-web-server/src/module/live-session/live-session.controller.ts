import { LiveSessionCreateRequestBodyDto, LiveSessionFindQueryDto } from '@dogu-private/console';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LiveSession } from '../../db/entity/live-session.entity';
import { ORGANIZATION_ROLE } from '../auth/auth.types';
import { OrganizationPermission } from '../auth/decorators';
import { LiveSessionService } from './live-session.service';

@Controller('/live-sessions')
export class LiveSessionController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly liveSessionService: LiveSessionService,
  ) {}

  @Get()
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async find(@Query() query: LiveSessionFindQueryDto): Promise<LiveSession[]> {
    return await this.liveSessionService.findAllByQuery(query);
  }

  @Post()
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async create(@Body() body: LiveSessionCreateRequestBodyDto): Promise<LiveSession> {
    return await this.liveSessionService.create(body);
  }
}
