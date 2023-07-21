// import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { InjectDataSource } from '@nestjs/typeorm';
// import { Request } from 'express';
// import { DataSource } from 'typeorm';
// import { config } from '../../../config';
// import { DoguLogger } from '../../logger/logger';
// import { CLINET_API_KEY, CLINET_API_TYPE } from '../auth.types';
// import { AuthApiAccessTokenService } from '../service/auth-api-access-token.service';
// import { printLog } from './common';

// @Injectable()
// export class ApiAccessTokenGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector, //
//     private readonly logger: DoguLogger,
//     @InjectDataSource()
//     private readonly dataSource: DataSource,
//     @Inject(AuthApiAccessTokenService)
//     private readonly AuthApiAccessTokenService: AuthApiAccessTokenService,
//   ) {}

//   async canActivate(ctx: ExecutionContext): Promise<boolean> {
//     const controllerRoleType: CLINET_API_TYPE = this.reflector.get<CLINET_API_TYPE>(CLINET_API_KEY, ctx.getHandler());
//     if (!controllerRoleType) {
//       throw new HttpException(`ApiAccessTokenGuard. The action is not defined.`, HttpStatus.UNAUTHORIZED);
//     }

//     if (config.gaurd.role.logging) {
//       printLog(ctx, 'ApiAccessTokenGuard', null);
//     }

//     const req = ctx.switchToHttp().getRequest<Request>();

//     const payload = await this.AuthApiAccessTokenService.validateApiToken(ctx, controllerRoleType);
//     if (!payload) {
//       return false;
//     }

//     req.user = payload;
//     return true;
//   }
// }
