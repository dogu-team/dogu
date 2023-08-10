import { UserId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ChangeLog } from '../../db/entity/change-log.entity';

@Injectable()
export class ChangeLogService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findChangeLogs(userId: UserId) {
    const repository = this.dataSource.getRepository(ChangeLog);
    const changeLogs = await repository
      .createQueryBuilder('changeLog')
      .leftJoinAndSelect('changeLog.userReactions', 'changeLogUserReaction', 'changeLogUserReaction.userId = :userId', { userId })
      .orderBy('changeLog.createdAt', 'DESC')
      .getMany();

    return changeLogs;
  }
}
