import { ChangeLogId, UserId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { ChangeLog } from '../../db/entity/change-log.entity';
import { ChangeLogUserReaction } from '../../db/entity/index';
import { User } from '../../db/entity/user.entity';
import { UpdateReactionToChangeLogDto } from './dto/change-log.dto';

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

  async updateReactionToChangeLog(userId: UserId, changeLogId: ChangeLogId, dto: UpdateReactionToChangeLogDto): Promise<void> {
    const { reactionType } = dto;
    const repository = this.dataSource.getRepository(ChangeLogUserReaction);
    const existing = await repository.findOne({ where: { changeLogId, userId } });

    if (existing) {
      this.dataSource.transaction(async (manager) => {
        await manager.softDelete(ChangeLogUserReaction, { changeLogId, userId });
        const newReaction = manager.create(ChangeLogUserReaction, { changeLogUserReactionId: v4(), changeLogId, userId, reactionType });
        await manager.save(ChangeLogUserReaction, newReaction);
      });
    } else {
      const newReaction = repository.create({ changeLogUserReactionId: v4(), changeLogId, userId, reactionType });
      await repository.save(newReaction);
    }
  }

  async deleteReactionToChangeLog(userId: UserId, changeLogId: ChangeLogId): Promise<void> {
    const repository = this.dataSource.getRepository(ChangeLogUserReaction);
    await repository.softDelete({ changeLogId, userId });
  }
}
