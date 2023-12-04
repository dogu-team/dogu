import { DestBase } from '@dogu-private/console';
import { DEST_STATE, isDestCompleted } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Dest } from '../../../../../db/entity/index';
import { DoguLogger } from '../../../../logger/logger';
// import { setDestState } from '../../common/runner';

@Injectable()
export class DestRunner {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
  ) {}

  public async update(dest: Dest, incomingState: DEST_STATE, localTimeStamp: Date): Promise<void> {
    const { destId, name, state: status } = dest;
    const destStateStr = DEST_STATE[status];
    const incomingStateStr = DEST_STATE[incomingState];

    this.logger.info(`Dest [${destId}][${name}] is in ${destStateStr} state. transition to ${incomingStateStr} state...`);
    await this.setState(this.dataSource.manager, dest, incomingState, new Date(), localTimeStamp);
  }

  async setState(manager: EntityManager, entity: DestBase, status: DEST_STATE, serverTimeStamp: Date, localTimeStamp: Date | null): Promise<void> {
    entity.state = status;
    if (status === DEST_STATE.RUNNING) {
      entity.localInProgressAt = localTimeStamp;
      entity.inProgressAt = serverTimeStamp;
    } else if (isDestCompleted(status)) {
      entity.completedAt = serverTimeStamp;
      entity.localCompletedAt = localTimeStamp;
    }

    await manager.getRepository(entity.constructor.name).save(entity);
  }
}
