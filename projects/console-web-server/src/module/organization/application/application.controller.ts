import { OrganizationApplicationWithIcon } from '@dogu-private/console';
import { CREATOR_TYPE, OrganizationId, UserPayload } from '@dogu-private/types';
import { BadRequestException, Body, Controller, Delete, Get, Param, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectDataSource } from '@nestjs/typeorm';
import path from 'path';
import { DataSource } from 'typeorm';
import { OrganizationApplication } from '../../../db/entity/organization-application.entity';

import { applicationFileParser } from '../../../utils/file';
import { ORGANIZATION_ROLE } from '../../auth/auth.types';
import { OrganizationPermission, User } from '../../auth/decorators';
import { Page } from '../../common/dto/pagination/page';
import { UploadSampleAppDto } from '../../project/application/dto/application.dto';
import { FindOrganizationApplicationByPackageNameDto, FindOrganizationApplicationDto } from './application.dto';
import { OrganizationApplicationService } from './application.service';

@Controller('organizations/:organizationId/applications')
export class OrganizationApplicationController {
  constructor(
    private readonly applicationService: OrganizationApplicationService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findApplications(@Param('organizationId') organizationId: OrganizationId, @Query() dto: FindOrganizationApplicationDto): Promise<Page<OrganizationApplicationWithIcon>> {
    return await this.applicationService.findApplications(organizationId, dto);
  }

  @Get('/packages')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findUniquePackageApplications(
    @Param('organizationId') organizationId: OrganizationId,
    @Query() dto: FindOrganizationApplicationByPackageNameDto,
  ): Promise<Page<OrganizationApplicationWithIcon>> {
    return await this.applicationService.findUniquePackageApplications(organizationId, dto);
  }

  @Get('/packages/:packageName')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findApplicationsByPackageName(
    @Param('organizationId') organizationId: OrganizationId,
    @Param('packageName') packageName: string,
    @Query() dto: FindOrganizationApplicationByPackageNameDto,
  ): Promise<Page<OrganizationApplicationWithIcon>> {
    return await this.applicationService.findApplicationsByPackageName(organizationId, packageName, dto);
  }

  @Get('/:applicationId/url')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async getApplicationUrl(@Param('applicationId') id: string, @Param('organizationId') organizationId: OrganizationId): Promise<string> {
    const applicationDownloadUrl = await this.applicationService.getApplicationDownladUrl(id, organizationId);
    return applicationDownloadUrl;
  }

  @Put()
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadOrganizationApplication(
    @UploadedFile(applicationFileParser) file: Express.Multer.File,
    @User() userPayload: UserPayload,
    @Param('organizationId') organizationId: OrganizationId,
  ): Promise<OrganizationApplication> {
    return await this.dataSource.transaction(async (manager) => {
      return await this.applicationService.uploadApplication(manager, file, userPayload.userId, CREATOR_TYPE.USER, organizationId);
    });
  }

  @Put('/samples')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async uploadSampleApp(@User() userPayload: UserPayload, @Param('organizationId') organizationId: OrganizationId, @Body() uploadSmapleAppDto: UploadSampleAppDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      let appFilePath: string;
      switch (uploadSmapleAppDto.category) {
        case 'mobile':
          appFilePath = path.resolve(__dirname, '../../../../samples/mobile/wikipedia-sample.apk');
          break;
        case 'game':
          if (uploadSmapleAppDto.extension === 'ipa') {
            appFilePath = path.resolve(__dirname, '../../../../samples/game/DoguRpgSample.ipa');
          } else {
            appFilePath = path.resolve(__dirname, '../../../../samples/game/dogurpgsample.apk');
          }
          break;
        default:
          throw new BadRequestException('Invalid category');
      }

      await this.applicationService.uploadSampleApp(manager, appFilePath, userPayload.userId, organizationId);
    });
  }

  @Delete('/packages/:packageName')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async deleteApplicationByPackage(@Param('packageName') packageName: string, @Param('organizationId') organizationId: OrganizationId): Promise<void> {
    await this.applicationService.deleteApplicationByPackage(organizationId, packageName);
  }

  @Delete('/:applicationId')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async deleteApplication(@Param('applicationId') id: string, @Param('organizationId') organizationId: OrganizationId): Promise<void> {
    await this.applicationService.deleteApplication(id, organizationId);
  }
}
