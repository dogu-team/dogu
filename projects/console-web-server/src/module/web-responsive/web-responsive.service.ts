import { GCP } from '@dogu-private/sdk';
import { UserId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CreateWebResponsiveDto } from './web-responsive.dto';

@Injectable()
export class WebResponsiveService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createWebResponsive(userId: UserId, dto: CreateWebResponsiveDto): Promise<void> {
    await GCP.runService('WEB_RESPONSIVE');
  }
}
