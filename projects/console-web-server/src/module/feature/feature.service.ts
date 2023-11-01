import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../../db/entity/user.entity';
import { FeatureConfig, FeatureTable } from '../../feature.config';

@Injectable()
export class FeatureService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  getFeatureConfig(): FeatureTable {
    return FeatureConfig.getAll();
  }

  async existsRootUser(): Promise<boolean> {
    const exist = await this.dataSource.getRepository(User).findOne({ where: { isRoot: true } });
    return exist ? true : false;
  }
}
