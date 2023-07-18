import { RemoteDestBase } from '@dogu-private/console';
import { DEST_STATE, isDestCompleted } from '@dogu-private/types';
import { EntityManager } from 'typeorm';
import { RemoteDest } from '../../../db/entity/remote-dest.entity';
import { logger } from '../../logger/logger.instance';

export module RemoteDestProcessor {
  export async function update(manager: EntityManager, remoteDest: RemoteDest, incomingState: DEST_STATE, localTimeStamp: Date): Promise<void> {
    const { remoteDestId, name, state } = remoteDest;
    const destStateStr = DEST_STATE[state];
    const incomingStateStr = DEST_STATE[incomingState];
    logger.info(`RemoteDest [${remoteDest}][${name}] is in ${destStateStr} state. transition to ${incomingStateStr} state...`);

    await setState(manager, remoteDest, incomingState, new Date(), localTimeStamp);
  }

  async function setState(manager: EntityManager, entity: RemoteDestBase, status: DEST_STATE, serverTimeStamp: Date, localTimeStamp: Date | null): Promise<void> {
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
