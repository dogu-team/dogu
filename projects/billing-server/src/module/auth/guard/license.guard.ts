import { LicensePayload, OrganizationId } from '@dogu-private/types';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { LicenseToken } from '../../../db/entity/license-token.enitiy';
import { LICENSE_ACTION, LICENSE_ACTION_KEY } from '../auth.types';

@Injectable()
export class LicenseGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const actionType: LICENSE_ACTION = this.reflector.get<LICENSE_ACTION>(LICENSE_ACTION_KEY, ctx.getHandler());
    if (!actionType) {
      throw new HttpException(`LicenseGuard. The role is not defined.`, HttpStatus.UNAUTHORIZED);
    }
    const req = ctx.switchToHttp().getRequest<Request>();

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpException(`token is required.`, HttpStatus.BAD_REQUEST);
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new HttpException(`token is required.`, HttpStatus.BAD_REQUEST);
    }

    const payload = await this.validate(actionType, ctx);
    req.user = payload;
    return true;
  }

  async validate(actionType: LICENSE_ACTION, ctx: ExecutionContext): Promise<LicensePayload> {
    switch (actionType) {
      case LICENSE_ACTION.CREATE: {
        const payload = this.validateCreateLicense(ctx);
        return payload;
      }
      case LICENSE_ACTION.RENEW:
        throw new HttpException(`not implemented.`, HttpStatus.NOT_IMPLEMENTED);
      case LICENSE_ACTION.GET: {
        const payload = await this.validateGetLicense(ctx);
        return payload;
      }
      default: {
        const _exhaustiveCheck: never = actionType;
        throw new Error(`Unhandled actionType: ${LICENSE_ACTION[_exhaustiveCheck]}`);
      }
    }
  }

  validateCreateLicense(ctx: ExecutionContext): LicensePayload {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpException(`apiToken is required.`, HttpStatus.BAD_REQUEST);
    }
    const apiToken = authHeader.split(' ')[1];
    if (!apiToken) {
      throw new HttpException(`apiToken is required.`, HttpStatus.BAD_REQUEST);
    }

    if (apiToken !== config.apiToken) {
      throw new HttpException(`apiToken is invalid.`, HttpStatus.UNAUTHORIZED);
    }

    return {
      licenseToken: '',
      companyName: null,
      organizationId: null,
    };
  }

  async validateGetLicense(ctx: ExecutionContext): Promise<LicensePayload> {
    const orgIdQuery = ctx.switchToHttp().getRequest<{ query: { organizationId: OrganizationId } }>().query.organizationId;
    const companyNameQuery = ctx.switchToHttp().getRequest<{ query: { companyName: string } }>().query.companyName;

    const req = ctx.switchToHttp().getRequest<Request>();

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpException(`token is required.`, HttpStatus.BAD_REQUEST);
    }
    const licenseToken = authHeader.split(' ')[1];
    if (!licenseToken) {
      throw new HttpException(`token is required.`, HttpStatus.BAD_REQUEST);
    }

    if (companyNameQuery && orgIdQuery) {
      throw new HttpException(`companyName and organizationId are mutually exclusive. companyName: ${companyNameQuery}, organizationId: ${orgIdQuery}`, HttpStatus.BAD_REQUEST);
    } else if (!companyNameQuery && !orgIdQuery) {
      throw new HttpException(`companyName or organizationId is required.`, HttpStatus.BAD_REQUEST);
    }

    const token = await this.dataSource.manager.getRepository(LicenseToken).findOne({ where: { token: licenseToken } });
    if (!token) {
      throw new HttpException(`license not found. licenseToken: ${licenseToken}`, HttpStatus.UNAUTHORIZED);
    }

    return {
      licenseToken: token.token,
      companyName: companyNameQuery,
      organizationId: orgIdQuery,
    };
  }
}
