import { OrganizationId } from '@dogu-private/types';
import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { OrganizatioApiToken } from '../../../db/entity/organization-api-token.entity';
import { Token } from '../../../db/entity/token.entity';
import { DoguLogger } from '../../logger/logger';
import { TokenService } from '../../token/token.service';
import { API_TOKEN_TYPE } from '../auth.types';

@Injectable()
export class AuthApiTokenService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
  ) {}

  public async validateApiToken(ctx: ExecutionContext, type: API_TOKEN_TYPE): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    const organizationId = req.params.organizationId;

    let apiToken = null;

    const authHeader = req.headers.authorization;
    if (authHeader) {
      apiToken = authHeader.split(' ')[1];
    } else {
      apiToken = req.body['accessKey'] as string;
    }
    if (!apiToken) {
      throw new HttpException('Api token is required', HttpStatus.UNAUTHORIZED);
    }

    switch (type) {
      case API_TOKEN_TYPE.ORGANIZATION: {
        const isValid = await this.validateOrganizationApiToken(organizationId, apiToken);
        return isValid;
      }
      // case API_TOKEN_TYPE.PROJECT: {
      // const projectId = req.params.projectId;
      // }
      default:
        const _exhaustiveCheck: never = type;
        return false;
    }
  }

  private async validateOrganizationApiToken(organizationId: OrganizationId, apiToken: string): Promise<boolean> {
    const token = await this.dataSource.getRepository(Token).findOne({ where: { token: apiToken } });
    if (!token) {
      return false;
    }

    const organizationApiToken = await this.dataSource.getRepository(OrganizatioApiToken).findOne({ where: { tokenId: token.tokenId } });
    if (!organizationApiToken) {
      return false;
    }

    if (organizationApiToken.organizationId !== organizationId) {
      return false;
    }

    if (TokenService.isExpired(token)) {
      return false;
    }

    return true;
  }
}
