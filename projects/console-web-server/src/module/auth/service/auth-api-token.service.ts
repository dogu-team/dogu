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

    switch (type) {
      case API_TOKEN_TYPE.CONSOLE: {
        // const isValid = await this.validateOrganizationApiToken(organizationId, apiToken);
        // return isValid;
        throw new HttpException('Not implemented', HttpStatus.NOT_IMPLEMENTED);
        return false;
      }
      case API_TOKEN_TYPE.WEBDRIVER_AGENT: {
        const isValid = await this.validateWebdriverAgentApiToken(req);
        return isValid;
      }
      default:
        const _exhaustiveCheck: never = type;
        return false;
    }
  }

  private async validateWebdriverAgentNewSession(req: Request): Promise<boolean> {
    const apiToken = this.getApiTokenByWedriverAgentRequest(req);
    if (!apiToken) {
      throw new HttpException('Api token is required', HttpStatus.UNAUTHORIZED);
    }

    const organizationId = this.getOrganizationIdByWedriverAgentRequest(req);
    if (!organizationId) {
      throw new HttpException('OrganizationId is required', HttpStatus.UNAUTHORIZED);
    }

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

  private getApiTokenByWedriverAgentRequest(req: Request): string | null {
    const apiToken = req.body['capabilities']?.['alwaysMatch']?.['dogu:options']?.['token'];
    if (!apiToken) return null;
    return apiToken as string;
  }

  private getOrganizationIdByWedriverAgentRequest(req: Request): string | null {
    const orgId = req.body['capabilities']?.['alwaysMatch']?.['dogu:options']?.['organizationId'];
    if (!orgId) return null;
    return orgId as string;
  }

  private async validateWebdriverAgentSession(req: Request): Promise<boolean> {
    return true;
  }

  private async validateWebdriverAgentApiToken(req: Request): Promise<boolean> {
    const url = req.url;
    const urlParse = url.replace(/\/+$/, '');
    const reqMethod = req.method;
    if (urlParse === '/remote/wd/hub/session' && reqMethod === 'POST') {
      const isValid = await this.validateWebdriverAgentNewSession(req);
      return isValid;
    }

    const isValid = await this.validateWebdriverAgentSession(req);
    return isValid;
  }
}
