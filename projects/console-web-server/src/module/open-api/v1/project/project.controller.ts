import { ProjectPropCamel } from '@dogu-private/console';
import { V1Project } from '@dogu-private/console-open-api';
import { CREATOR_TYPE, ProjectId, V1CALLER_TYPE, V1OpenApiPayload } from '@dogu-private/types';
import { Controller, Inject, Param, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { applicationFileParser } from '../../../../utils/file';
import { PROJECT_ROLE } from '../../../auth/auth.types';
import { V1OpenApiCaller, V1OpenApiProjectPermission } from '../../../auth/decorators';
import { V1ProjectService } from './project.service';

@Controller(V1Project.controller.path)
export class V1ProjectController {
  constructor(
    @Inject(V1ProjectService)
    private readonly v1ProjectService: V1ProjectService, // @InjectDataSource() // private readonly dataSource: DataSource,
  ) {}

  @Put(V1Project.uploadApplicatoin.path)
  @V1OpenApiProjectPermission(PROJECT_ROLE.WRITE)
  @UseInterceptors(FileInterceptor('file'))
  async uploadApplication(
    @UploadedFile(applicationFileParser) file: Express.Multer.File,
    @V1OpenApiCaller() openApiCaller: V1OpenApiPayload,
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
  ) {
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
    await this.v1ProjectService.uploadApplication(file, projectId, creatorId, creatorType);
  }
}
