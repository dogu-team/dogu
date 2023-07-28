import { createLogger } from '../common-utils.js';
import { DoguConfig } from '../dogu-config.js';
import { DestData, DestHandler, DestInfo, DestState, NullDestHandler } from './common.js';
import { RoutineDestClient } from './routine-dest.client.js';
import { RoutineDestData, RoutineDestInfo, RoutineDestOptions } from './routine-dest.types.js';

export class RoutineDestHandler extends DestHandler<RoutineDestInfo, RoutineDestData> {
  private readonly logger = createLogger('RoutineDestHandler');
  private client: RoutineDestClient;

  constructor(options: RoutineDestOptions) {
    super();
    this.client = new RoutineDestClient(options);
    this.logger.info('created');
  }

  onTransformDestInfoToDestInfoLike(destInfo: DestInfo): RoutineDestInfo {
    const { children, ...rest } = destInfo;
    return {
      ...rest,
      children: children.map((child) => this.onTransformDestInfoToDestInfoLike(child)),
    };
  }

  onTransformDestDataLikeToDestData(destDataLike: RoutineDestData): DestData {
    const { destId, routineStepId, name, type, index, state, children } = destDataLike;
    return {
      id: destId.toString(),
      ownerId: routineStepId.toString(),
      name,
      type,
      index,
      state,
      children: children.map((child) => this.onTransformDestDataLikeToDestData(child)),
    };
  }

  onTransformDestDataToDestDataLike(destData: DestData): RoutineDestData {
    const { id, ownerId, name, type, index, state, children } = destData;
    const destId = Number(id);
    if (Number.isNaN(destId)) {
      throw new Error(`destId is not a number: ${id}`);
    }
    const routineStepId = Number(ownerId);
    if (Number.isNaN(routineStepId)) {
      throw new Error(`routineStepId is not a number: ${ownerId}`);
    }
    return {
      destId: Number(id),
      routineStepId: Number(ownerId),
      name,
      type,
      index,
      state,
      children: children.map((child) => this.onTransformDestDataToDestDataLike(child)),
    };
  }

  onCreateDestInfoLikes(destInfoLikes: RoutineDestInfo[]): Promise<RoutineDestData[]> {
    return this.client.createRoutineDest(destInfoLikes);
  }

  onUpdateDestDataLike(destDataLike: RoutineDestData, destState: DestState): Promise<void> {
    return this.client.updateRoutineDestState(destDataLike.destId, destState, new Date().toISOString());
  }
}

export class RoutineDestHandlerFactory {
  private readonly logger = createLogger('RoutineDestHandlerFactory');

  constructor(private readonly doguConfig: DoguConfig) {}

  create(): DestHandler {
    if (!this.doguConfig.stepId) {
      this.logger.error('stepId is not set. skip routine dest reporting');
      return new NullDestHandler();
    }

    if (!this.doguConfig.deviceId) {
      this.logger.error('deviceId is not set. skip routine dest reporting');
      return new NullDestHandler();
    }

    if (!this.doguConfig.hostToken) {
      this.logger.error('hostToken is not set. skip routine dest reporting');
      return new NullDestHandler();
    }

    const options: RoutineDestOptions = {
      apiBaseUrl: this.doguConfig.apiBaseUrl,
      organizationId: this.doguConfig.organizationId,
      deviceId: this.doguConfig.deviceId,
      stepId: this.doguConfig.stepId,
      hostToken: this.doguConfig.hostToken,
    };
    return new RoutineDestHandler(options);
  }
}
