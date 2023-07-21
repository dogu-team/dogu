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

    const token = this.getToken(req);
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

  public getDoguOptions(req: Request): object {
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

  public getToken(req: Request): string | null {
    const apiToken = req.body['capabilities']?.['alwaysMatch']?.['dogu:options']?.['token'];
    if (!apiToken) return null;
    return apiToken as string;
  }

  public getOrganizationId(req: Request): string | null {
    const orgId = req.body['capabilities']?.['alwaysMatch']?.['dogu:options']?.['organizationId'];
    if (!orgId) return null;
    return orgId as OrganizationId;
  }

  public getProjectId(req: Request): string | null {
    const projectId = req.body['capabilities']?.['alwaysMatch']?.['dogu:options']?.['projectId'];
    if (!projectId) return null;
    return projectId as ProjectId;
  }
}
