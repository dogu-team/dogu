import { OrganizationPropCamel } from '@dogu-private/console';
import { V1Organization } from '@dogu-private/console-open-api';
import { CREATOR_TYPE, OrganizationId, V1CALLER_TYPE, V1OpenApiPayload } from '@dogu-private/types';
import { Controller, Inject, Param, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { LICENSE_AUTHROIZE, ORGANIZATION_ROLE } from '../../../../../module/auth/auth.types';
import { LicensePermission, V1OpenApiCaller, V1OpenApiOrganizationPermission } from '../../../../../module/auth/decorators';
import { applicationFileParser } from '../../../../../utils/file';
import { V1OrganizationService } from './organization.service';

@Controller(V1Organization.controller.path)
export class V1OrganizationController {
  constructor(
    @Inject(V1OrganizationService)
    private readonly v1OrganizationService: V1OrganizationService, // @InjectDataSource() // private readonly dataSource: DataSource,
  ) {}

  @Put(V1Organization.uploadApplicatoin.path)
  @V1OpenApiOrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  @LicensePermission(LICENSE_AUTHROIZE.OPEN_API)
  @UseInterceptors(FileInterceptor('file'))
  async uploadApplication(
    @UploadedFile(applicationFileParser) file: Express.Multer.File,
    @V1OpenApiCaller() openApiCaller: V1OpenApiPayload,
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
  ): Promise<void> {
    let creatorId = null;
    let creatorType: CREATOR_TYPE;
    switch (openApiCaller.callerType) {
      case V1CALLER_TYPE.USER: {
        creatorType = CREATOR_TYPE.USER;
        creatorId = openApiCaller.userId!;
        break;
      }
      case V1CALLER_TYPE.ORGANIZATION: {
        creatorType = CREATOR_TYPE.ORGANIZATION;
        break;
      }
      case V1CALLER_TYPE.PROJECT: {
        creatorType = CREATOR_TYPE.PROJECT;
        break;
      }
      default: {
        const _exaustiveCheck: never = openApiCaller.callerType;
        throw new Error(`Unexpected callerType: ${_exaustiveCheck}`);
        break;
      }
    }
    await this.v1OrganizationService.uploadApplication(file, organizationId, creatorId, creatorType);
  }
}
