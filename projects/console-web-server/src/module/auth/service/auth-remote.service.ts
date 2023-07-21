import { OrganizationId, ProjectId } from '@dogu-private/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { Token } from '../../../db/entity/token.entity';
import { DoguLogger } from '../../logger/logger';
import { TokenService } from '../../token/token.service';

@Injectable()
export class AuthRemoteService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
  ) {}

  public async validateRequestData(req: Request): Promise<void> {
    const doguOptions = req.body['capabilities']?.['alwaysMatch']?.['dogu:options'];
    if (!doguOptions) {
      throw new HttpException('dogu:options is required', HttpStatus.BAD_REQUEST);
    }
    //FIXME:(felix) check doguOptions type

    const token = this.getTokenByWedriverAgentRequest(req);
    if (!token) {
      throw new HttpException('Token is required', HttpStatus.UNAUTHORIZED);
    }
    const tokenCheck = await this.dataSource.getRepository(Token).findOne({ where: { token: token } });
    if (!tokenCheck) {
      throw new HttpException('Token is invalid', HttpStatus.UNAUTHORIZED);
    }

    if (TokenService.isExpired(tokenCheck)) {
      throw new HttpException('Token is expired', HttpStatus.UNAUTHORIZED);
    }

    this.validateUrl(req);

    return doguOptions;
  }

  public getDoguOptionsByRequest(req: Request): object {
    const doguOptions = req.body['capabilities']?.['alwaysMatch']?.['dogu:options'];
    if (!doguOptions) {
      throw new HttpException('dogu:options is required', HttpStatus.BAD_REQUEST);
    }

    return doguOptions;
  }

  private async validateUrl(req: Request): Promise<void> {
    const url = req.url;
    const urlParse = url.replace(/\/+$/, '');
    const reqMethod = req.method;
    if (urlParse === '/remote/wd/hub/session' && reqMethod === 'POST') {
      return;
    } else {
      throw new HttpException('Url is invalid', HttpStatus.UNAUTHORIZED);
    }
  }

  public getTokenByWedriverAgentRequest(req: Request): string | null {
    const apiToken = req.body['capabilities']?.['alwaysMatch']?.['dogu:options']?.['token'];
    if (!apiToken) return null;
    return apiToken as string;
  }

  public getOrganizationIdByRequest(req: Request): string | null {
    const orgId = req.body['capabilities']?.['alwaysMatch']?.['dogu:options']?.['organizationId'];
    if (!orgId) return null;
    return orgId as OrganizationId;
  }

  public getProjectIdByRequest(req: Request): string | null {
    const projectId = req.body['capabilities']?.['alwaysMatch']?.['dogu:options']?.['projectId'];
    if (!projectId) return null;
    return projectId as ProjectId;
  }

  // private async validateWebdriverAgentNewSession(req: Request): Promise<boolean> {
  //   const apiToken = this.getTokenByWedriverAgentRequest(req);
  //   if (!apiToken) {
  //     throw new HttpException('Api token is required', HttpStatus.UNAUTHORIZED);
  //   }

  //   const organizationId = this.getOrganizationIdByRequest(req);
  //   if (!organizationId) {
  //     throw new HttpException('OrganizationId is required', HttpStatus.UNAUTHORIZED);
  //   }

  //   const token = await this.dataSource.getRepository(Token).findOne({ where: { token: apiToken } });
  //   if (!token) {
  //     return false;
  //   }

  //   const organizationApiToken = await this.dataSource.getRepository(OrganizationAccessToken).findOne({ where: { tokenId: token.tokenId } });
  //   if (!organizationApiToken) {
  //     return false;
  //   }

  //   if (organizationApiToken.organizationId !== organizationId) {
  //     return false;
  //   }

  //   if (TokenService.isExpired(token)) {
  //     return false;
  //   }

  //   return true;
  // }

  // private async validateWebdriverAgentSession(req: Request): Promise<boolean> {
  //   return true;
  // }

  // private async validateWebdriverAgentApiToken(req: Request): Promise<boolean> {
  //   const url = req.url;
  //   const urlParse = url.replace(/\/+$/, '');
  //   const reqMethod = req.method;
  //   if (urlParse === '/remote/wd/hub/session' && reqMethod === 'POST') {
  //     const isValid = await this.validateWebdriverAgentNewSession(req);
  //     return isValid;
  //   }

  //   const isValid = await this.validateWebdriverAgentSession(req);
  //   return isValid;
  // }
}
