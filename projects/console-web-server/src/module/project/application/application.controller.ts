import { ProjectApplicationWithIcon } from '@dogu-private/console';
import { OrganizationId, ProjectId, UserPayload } from '@dogu-private/types';
import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectDataSource } from '@nestjs/typeorm';
import path from 'path';
import { DataSource } from 'typeorm';

import { applicationFileParser } from '../../../utils/file';
import { PROJECT_ROLE } from '../../auth/auth.types';
import { ProjectPermission, User } from '../../auth/decorators';
import { Page } from '../../common/dto/pagination/page';
import { ApplicationService } from './application.service';
import { FindProjectApplicationDto, UploadSampleAppDto } from './dto/application.dto';

@Controller('organizations/:organizationId/projects')
export class ApplicationController {
  constructor(
    @Inject(ApplicationService)
    private readonly applicationService: ApplicationService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get(':projectId/applications')
  @ProjectPermission(PROJECT_ROLE.READ)
  async getApplications(
    @Param('organizationId') organizationId: string,
    @Param('projectId') projectId: string,
    @Query() dto: FindProjectApplicationDto,
  ): Promise<Page<ProjectApplicationWithIcon>> {
    const applicationList = await this.applicationService.getApplicationList(organizationId, projectId, dto);
    return applicationList;
  }

  @Get(':projectId/applications/:id/url')
  @ProjectPermission(PROJECT_ROLE.READ)
  async getApplicationUrl(@Param('id') id: number, @Param('organizationId') organizationId: string, @Param('projectId') projectId: string): Promise<string> {
    const applicationDownloadUrl = await this.applicationService.getApplicationDownladUrl(id, organizationId, projectId);
    return applicationDownloadUrl;
  }

  @Put(':projectId/applications')
  @ProjectPermission(PROJECT_ROLE.WRITE)
  @UseInterceptors(FileInterceptor('file'))
  async uploadApplication(
    @UploadedFile(applicationFileParser) file: Express.Multer.File,
    @User() userPayload: UserPayload,
    @Param('organizationId') organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
  ) {
    await this.dataSource.transaction(async (manager) => {
      await this.applicationService.uploadApplication(manager, file, userPayload.userId, organizationId, projectId);
    });
  }

  @Delete(':projectId/applications/:id')
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async deleteApplication(@Param('id') id: number, @Param('organizationId') organizationId: string, @Param('projectId') projectId: string) {
    await this.applicationService.deleteApplication(id, organizationId, projectId);
  }

  @Put(':projectId/applications/samples')
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async uploadSampleApp(
    @User() userPayload: UserPayload,
    @Param('organizationId') organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Body() uploadSmapleAppDto: UploadSampleAppDto,
  ) {
    await this.dataSource.transaction(async (manager) => {
      let appFilePath: string;
      switch (uploadSmapleAppDto.category) {
        case 'mobile':
          appFilePath = path.resolve(__dirname, '../../../../samples/mobile/wikipedia-sample.apk');
          break;
        case 'game':
          appFilePath = path.resolve(__dirname, '../../../../samples/game/dogurpgsample.apk');
          break;
        default:
          throw new BadRequestException('Invalid category');
      }

      await this.applicationService.uploadSampleApk(manager, appFilePath, userPayload.userId, organizationId, projectId);
    });
  }
}
