// import { FindLicenseDtoBase, LicenseResponse } from '@dogu-private/console';
import { RegisterSelfHostedLicenseDto, SelfHostedLicenseBase } from '@dogu-private/console';
import { UserPayload } from '@dogu-private/types';
import { Body, Controller, Get, Inject, NotFoundException, Post } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { OrganizationAndUserAndOrganizationRole } from '../../../db/entity/index';
import { SELF_HOSTED_ROLE } from '../../../module/auth/auth.types';
import { SelfHostedPermission, User } from '../../../module/auth/decorators';
import { SelfHostedLicenseService } from './self-hosted-license.service';

@Controller('licenses')
export class LicenseSelfHostedController {
  constructor(
    @Inject(SelfHostedLicenseService)
    private readonly selfHostedLicenseService: SelfHostedLicenseService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Post('')
  @SelfHostedPermission(SELF_HOSTED_ROLE.ROOT)
  async setLicense(@User() user: UserPayload, @Body() dto: RegisterSelfHostedLicenseDto): Promise<SelfHostedLicenseBase> {
    const { licenseKey } = dto;
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

    const license = await this.selfHostedLicenseService.setLicense(organizationId, licenseKey);
    return license;
  }

  @Get('')
  @SelfHostedPermission(SELF_HOSTED_ROLE.ROOT)
  async getLicense(@User() user: UserPayload): Promise<SelfHostedLicenseBase> {
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

    const license = await this.selfHostedLicenseService.getLicenseInfo(organizationId);
    return license;
  }

  // @Patch('')
  // @SelfHostedPermission(SELF_HOSTED_ROLE.ROOT)
  // async renewLicense(@Body() dto: FindLicenseDtoBase): Promise<LicenseResponse> {
  //   const rv = await this.dataSource.manager.transaction(async (manager) => {
  //     const token = await this.licenseService.renewLicense(manager, dto);
  //     return token;
  //   });
  //   return rv;
  // }
  // @Delete('')
  // @SelfHostedPermission(SELF_HOSTED_ROLE.ROOT)
  // async deleteLicense(): Promise<void> {
  //   throw new Error('Method not implemented.');
  // }
}
