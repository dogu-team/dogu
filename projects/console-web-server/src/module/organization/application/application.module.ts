import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationApplication } from '../../../db/entity/organization-application.entity';
import { OrganizationApplicationController } from './application.controller';
import { OrganizationApplicationService } from './application.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationApplication])],
  providers: [OrganizationApplicationService],
  controllers: [OrganizationApplicationController],
  exports: [OrganizationApplicationService],
})
export class OrganizationApplicationModule {}
