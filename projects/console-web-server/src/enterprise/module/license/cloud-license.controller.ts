import { CloudLicenseBase } from '@dogu-private/console';
import { UserPayload } from '@dogu-private/types';
import { Controller, Get, Inject, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { OrganizationAndUserAndOrganizationRole } from '../../../db/entity/index';
import { EMAIL_VERIFICATION } from '../../../module/auth/auth.types';
import { EmailVerification, User } from '../../../module/auth/decorators';
import { CloudLicenseService } from './cloud-license.service';

@Controller('cloud-licenses')
export class CloudLicenseController {
  constructor(
    @Inject(CloudLicenseService)
    private readonly cloudLicenseService: CloudLicenseService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get('')
  @EmailVerification(EMAIL_VERIFICATION.VERIFIED)
  async getLicense(@User() user: UserPayload): Promise<CloudLicenseBase> {
    const organizationRole = await this.dataSource.getRepository(OrganizationAndUserAndOrganizationRole).findOne({
      where: {
        userId: user.userId,
      },
      order: {
        createdAt: 'ASC',
      },
    });
    if (!organizationRole) {
      throw new NotFoundException('User has no organization');
    }

    const organizationId = organizationRole.organizationId;

    const license = await this.cloudLicenseService.getLicenseInfo(organizationId);
    return license;
  }
}
