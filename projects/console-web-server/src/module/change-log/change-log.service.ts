import { UserId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ChangeLog } from '../../db/entity/change-log.entity';
import { User } from '../../db/entity/user.entity';

@Injectable()
export class ChangeLogService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findChangeLogs(userId: UserId): Promise<ChangeLog[]> {
    const repository = this.dataSource.getRepository(ChangeLog);
    const changeLogs = await repository
      .createQueryBuilder('changeLog')
      .leftJoinAndSelect('changeLog.userReactions', 'changeLogUserReaction', 'changeLogUserReaction.userId = :userId', { userId })
      .orderBy('changeLog.createdAt', 'DESC')
      .getMany();

    return changeLogs;
  }

  async updateLastSeenChangeLog(userId: UserId): Promise<void> {
    const repository = this.dataSource.getRepository(User);
    await repository.update({ userId }, { lastChangeLogSeenAt: new Date() });
  }
}
