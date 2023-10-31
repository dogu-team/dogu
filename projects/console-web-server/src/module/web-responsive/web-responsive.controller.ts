import { UserPayload } from '@dogu-private/types';
import { Body, Controller, Post } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { User } from '../../module/auth/decorators';
import { CreateWebResponsiveDto } from './web-responsive.dto';
import { WebResponsiveService } from './web-responsive.service';

@Controller('/web-responsive')
export class WebResponsiveController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly service: WebResponsiveService,
  ) {}

  @Post('/create')
  async createWebResponsive(@User() user: UserPayload, @Body() dto: CreateWebResponsiveDto): Promise<void> {
    const rv = await this.dataSource.transaction(async (manager) => {
      await this.service.createWebResponsive(user.userId, dto);
    });

    return rv;
  }
}
