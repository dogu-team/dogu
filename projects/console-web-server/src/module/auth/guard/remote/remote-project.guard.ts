import { CREATOR_TYPE, RemotePayload } from '@dogu-private/types';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { config } from '../../../../config';
import { Project, Token } from '../../../../db/entity/index';
import { OrganizationAccessToken } from '../../../../db/entity/organization-access-token.entity';
import { PersonalAccessToken } from '../../../../db/entity/personal-access-token.entity';
import { ProjectAccessToken } from '../../../../db/entity/project-access-token.entity';
import { DoguLogger } from '../../../logger/logger';
import { ORGANIZATION_ROLE, PROJECT_ROLE, REMOTE_PROJECT_ROLE_KEY } from '../../auth.types';
import { AuthRemoteService } from '../../service/auth-remote.service';
import { printLog, UserPermission } from '../common';

@Injectable()
export class RemoteProjectGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(AuthRemoteService)
    private readonly authRemoteService: AuthRemoteService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const controllerRoleType: PROJECT_ROLE = this.reflector.get<PROJECT_ROLE>(REMOTE_PROJECT_ROLE_KEY, ctx.getHandler());
    if (!controllerRoleType) {
      throw new HttpException(`RemoteProjectGuard. The role is not defined.`, HttpStatus.UNAUTHORIZED);
    }

    if (config.gaurd.role.logging) {
      printLog(ctx, 'RemoteProjectGuard', controllerRoleType);
    }

    const req = ctx.switchToHttp().getRequest<Request>();
    const tokenByRequest = this.authRemoteService.getToken(req);
    if (!tokenByRequest) {
      throw new HttpException(`RemoteOrganizationGuard. The token is not defined.`, HttpStatus.UNAUTHORIZED);
    }

    const token = await this.dataSource.getRepository(Token).findOne({ where: { token: tokenByRequest } });
    if (!token) {
      throw new HttpException(`RemoteOrganizationGuard. The token is invalid.`, HttpStatus.UNAUTHORIZED);
    }

    // validate by org
    const orgByToken = await this.dataSource.getRepository(OrganizationAccessToken).findOne({ where: { tokenId: token.tokenId } });
    const orgIdByRequest = this.authRemoteService.getOrganizationId(req)!;
    const projectIdByRequest = this.authRemoteService.getProjectId(req)!;
    const project = await this.dataSource.getRepository(Project).findOne({ where: { projectId: projectIdByRequest } });
    const orgIdByProject = project?.organizationId;

    if (orgByToken && orgByToken.organizationId === orgIdByRequest) {
      const payload: RemotePayload = {
        organizationId: orgByToken.organizationId,
        creatorType: CREATOR_TYPE.ORGANIZATION,
      };
      req.user = payload;
      return true;
    }

    // validate by project
    const projectByToken = await this.dataSource.getRepository(ProjectAccessToken).findOne({ where: { tokenId: token.tokenId } });
    if (projectByToken && projectByToken.projectId === projectIdByRequest) {
      const payload: RemotePayload = {
        projectId: projectByToken.projectId,
        creatorType: CREATOR_TYPE.PROJECT,
      };
      req.user = payload;
      return true;
    }

    // validate by user
    const userByToken = await this.dataSource.getRepository(PersonalAccessToken).findOne({ where: { tokenId: token.tokenId } });
    if (!userByToken) {
      throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED);
    }

    const userId = userByToken.userId;
    const orgId = orgIdByProject || orgIdByRequest;
    const organizationRole = await UserPermission.getOrganizationUserRole(this.dataSource.manager, orgId, userId);
    if (UserPermission.validateOrganizationRolePermission(organizationRole, ORGANIZATION_ROLE.ADMIN)) {
      const payload: RemotePayload = {
        userId: userId,
        creatorType: CREATOR_TYPE.USER,
      };
      req.user = payload;
      return true;
    }

    const userWithOrgProjectRole = await UserPermission.getUserWithOrganizationRoleAndProjectRoleGroup(this.dataSource.manager, orgId, projectIdByRequest, userId);
    if (!userWithOrgProjectRole) {
      this.logger.error(`The user is not a member of the organization.`);
      throw new HttpException(`The user is not a member of the organization.`, HttpStatus.UNAUTHORIZED);
    }

    if (!UserPermission.checkProjectPermission(userWithOrgProjectRole, controllerRoleType)) {
      throw new HttpException(`The user does not have permission to access the project.`, HttpStatus.UNAUTHORIZED);
    }

    const payload: RemotePayload = {
      userId: userId,
      creatorType: CREATOR_TYPE.USER,
    };
    req.user = payload;
    return true;
  }
}
