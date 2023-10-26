import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BillingApiTokenService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}
}
