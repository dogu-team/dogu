import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { Token } from '../../../../../db/entity/token.entity';
import { DoguLogger } from '../../../../logger/logger';
import { TokenService } from '../../../../token/token.service';

@Injectable()
export class V1AuthOpenApiService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
  ) {}

  public async validateRequestData(req: Request): Promise<void> {
    const projectId = req.params.projectId;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpException('Token is required', HttpStatus.UNAUTHORIZED);
    }
    const token = authHeader.split(' ')[1];

    const tokenCheck = await this.dataSource.getRepository(Token).findOne({ where: { token: token } });
    if (!tokenCheck) {
      throw new HttpException('Token is invalid', HttpStatus.UNAUTHORIZED);
    }

    if (TokenService.isExpired(tokenCheck)) {
      throw new HttpException('Token is expired', HttpStatus.UNAUTHORIZED);
    }
  }

  public getToken(req: Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpException('Token is required', HttpStatus.UNAUTHORIZED);
    }
    const token = authHeader.split(' ')[1];
    return token;
  }
}
