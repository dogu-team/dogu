import { CALLER_TYPE, RemotePayload } from '@dogu-private/types';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { config } from '../../../../config';
import { OrganizationAccessToken } from '../../../../db/entity/organization-access-token.entity';
import { PersonalAccessToken } from '../../../../db/entity/personal-access-token.entity';
import { ProjectAccessToken } from '../../../../db/entity/project-access-token.entity';
import { Token } from '../../../../db/entity/token.entity';
import { DoguLogger } from '../../../logger/logger';
import { ORGANIZATION_ROLE, REMOTE_ORGANIZATION_ROLE_KEY } from '../../auth.types';
import { AuthRemoteService } from '../../service/auth-remote.service';
import { printLog, UserPermission } from '../common';

@Injectable()
export class RemoteOrganizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(AuthRemoteService)
    private readonly authRemoteService: AuthRemoteService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const controllerRoleType: ORGANIZATION_ROLE = this.reflector.get<ORGANIZATION_ROLE>(REMOTE_ORGANIZATION_ROLE_KEY, ctx.getHandler());
    if (!controllerRoleType) {
      throw new HttpException(`RemoteOrganizationGuard. The role is not defined.`, HttpStatus.UNAUTHORIZED);
    }

    if (config.gaurd.role.logging) {
      printLog(ctx, 'RemoteOrganizationGuard', controllerRoleType);
    }

    const req = ctx.switchToHttp().getRequest<Request>();
    const tokenByRequest = this.authRemoteService.getTokenByWedriverAgentRequest(req);
    if (!tokenByRequest) {
      throw new HttpException(`RemoteOrganizationGuard. The token is not defined.`, HttpStatus.UNAUTHORIZED);
    }

    const token = await this.dataSource.getRepository(Token).findOne({ where: { token: tokenByRequest } });
    if (!token) {
      throw new HttpException(`RemoteOrganizationGuard. The token is invalid.`, HttpStatus.UNAUTHORIZED);
    }

    const projectByToken = await this.dataSource.getRepository(ProjectAccessToken).findOne({ where: { tokenId: token.tokenId } });
    if (projectByToken) {
      throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED);
    }

    // validate by org
    const orgByToken = await this.dataSource.getRepository(OrganizationAccessToken).findOne({ where: { tokenId: token.tokenId } });
    const orgIdByRequest = this.authRemoteService.getOrganizationIdByRequest(req)!;
    if (orgByToken) {
      const orgId = orgByToken.organizationId;
      if (orgId === orgIdByRequest) {
        const payload: RemotePayload = {
          organizationId: orgIdByRequest,
          callerType: CALLER_TYPE.ORGANIZATION,
        };
        req.user = payload;
        return true;
      }
    }

    // validate by user
    const userByToken = await this.dataSource.getRepository(PersonalAccessToken).findOne({ where: { tokenId: token.tokenId } });
    if (!userByToken) {
      throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED);
    }

    const userId = userByToken.userId;
    const organizationRole = await UserPermission.getOrganizationUserRole(this.dataSource.manager, orgIdByRequest, userId);
    UserPermission.validateOrganizationRolePermission(organizationRole, controllerRoleType);

    const payload: RemotePayload = {
      userId: userId,
      callerType: CALLER_TYPE.USER,
    };

    req.user = payload;

    return true;
  }
}
