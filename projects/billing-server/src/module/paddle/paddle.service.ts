import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DoguLogger } from '../logger/logger';
import { PaddleCaller } from './paddle.caller';

@Injectable()
export class PaddleService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly paddleCaller: PaddleCaller,
  ) {}
}
