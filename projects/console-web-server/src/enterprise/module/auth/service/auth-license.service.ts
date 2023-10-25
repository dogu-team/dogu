import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource } from 'typeorm';

import { Project } from '../../../../db/entity/project.entity';
import { FEATURE_CONFIG } from '../../../../feature.config';
import { LICENSE_AUTHROIZE } from '../../../../module/auth/auth.types';
import { SelfHostedLicenseService } from '../../license/self-hosted-license.service';

@Injectable()
export class AuthLicenseService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(SelfHostedLicenseService)
    private readonly selfHostedLicenseService: SelfHostedLicenseService,
  ) {}

  public async validateLicense(req: Request, type: LICENSE_AUTHROIZE): Promise<void> {
    switch (type) {
      case LICENSE_AUTHROIZE.OPEN_API:
        await this.validateOpenApiLicense(req);
        break;
      case LICENSE_AUTHROIZE.DOGU_AGENT_AUTO_UPDATE:
        await this.validateDoguAgentAutoUpdateLicense(req);
        break;
      default:
        const _exhaustiveCheck: never = type;
        throw new HttpException(`LicenseGuard. The action is not defined. ${_exhaustiveCheck}`, HttpStatus.UNAUTHORIZED);
    }
  }

  private async validateOpenApiLicense(req: Request): Promise<void> {
    const orgIdByRequest = req.params.organizationId;
    const projectIdByRequest = req.params.projectId;
    const project = await this.dataSource.getRepository(Project).findOne({ where: { projectId: projectIdByRequest } });
    const orgIdByProject = project?.organizationId;
    const orgId = orgIdByRequest || orgIdByProject;

    if (!orgId) {
      throw new UnauthorizedException(`No organizationId information.`);
    }

    if (FEATURE_CONFIG.get('licenseModule') === 'self-hosted') {
      const license = await this.selfHostedLicenseService.getLicenseInfo(orgId);
      if (!license.openApiEnabled) {
        throw new UnauthorizedException(`OpenApi is not enabled.`);
      }
    }
  }

  private async validateDoguAgentAutoUpdateLicense(req: Request): Promise<void> {
    const orgIdByRequest = req.params.organizationId;

    if (FEATURE_CONFIG.get('licenseModule') === 'self-hosted') {
      const license = await this.selfHostedLicenseService.getLicenseInfo(orgIdByRequest);
      if (!license.doguAgentAutoUpdateEnabled) {
        throw new UnauthorizedException(`DoguAgentAutoUpdate is not enabled.`);
      }
    }
  }
}
