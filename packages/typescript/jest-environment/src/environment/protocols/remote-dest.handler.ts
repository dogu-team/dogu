import _ from 'lodash';

import { createLogger } from '../common-utils.js';
import { DoguConfig } from '../dogu-config.js';
import { DestData, DestHandler, DestInfo, DestState, NullDestHandler } from './common.js';
import { RemoteDestClient } from './remote-dest.client.js';
import { RemoteDestInfo, RemoteDestOptions, RemoteJestData } from './remote-dest.types.js';

export class RemoteDestHandler extends DestHandler<RemoteDestInfo, RemoteJestData> {
  private readonly logger = createLogger('RemoteDestHandler');
  private client: RemoteDestClient;

  constructor(options: RemoteDestOptions) {
    super();
    this.client = new RemoteDestClient(options);
    this.logger.info('created');
  }

  onTransformDestInfoToDestInfoLike(destInfo: DestInfo): RemoteDestInfo {
    const { children, ...rest } = destInfo;
    return {
      ...rest,
      children: children.map((child) => this.onTransformDestInfoToDestInfoLike(child)),
    };
  }

  onTransformDestDataLikeToDestData(destDataLike: RemoteJestData): DestData {
    const { remoteDestId, remoteDeviceJobId, name, type, index, state, children } = destDataLike;
    return {
      id: remoteDestId,
      ownerId: remoteDeviceJobId,
      name,
      type,
      index,
      state,
      children: children.map((child) => this.onTransformDestDataLikeToDestData(child)),
    };
  }

  onTransformDestDataToDestDataLike(destData: DestData): RemoteJestData {
    const { id, ownerId, name, type, index, state, children } = destData;
    return {
      remoteDestId: id,
      remoteDeviceJobId: ownerId,
      name,
      type,
      index,
      state,
      children: children.map((child) => this.onTransformDestDataToDestDataLike(child)),
    };
  }

  onCreateDestInfoLikes(destInfoLikes: RemoteDestInfo[]): Promise<RemoteJestData[]> {
    this.logger.info(`create dest`, {
      destInfoLikes,
    });
    return this.client.createRemoteDest(destInfoLikes);
  }

  onUpdateDestDataLike(destDataLike: RemoteJestData, destState: DestState): Promise<void> {
    return this.client.updateRemoteDestState(destDataLike.remoteDestId, destState, new Date().toISOString());
  }
}

export class RemoteDestHandlerFactory {
  private readonly logger = createLogger('RemoteDestHandlerFactory');

  constructor(private readonly doguConfig: DoguConfig, private readonly driver: WebdriverIO.Browser) {}

  create(): DestHandler {
    const remoteDeviceJobId = _.get(this.driver.capabilities, 'dogu:results.remoteDeviceJobId') as string | undefined;
    if (!remoteDeviceJobId) {
      this.logger.info('remoteDeviceJobId is not found');
      return new NullDestHandler();
    }

    const options: RemoteDestOptions = {
      apiBaseUrl: this.doguConfig.apiBaseUrl,
      projectId: this.doguConfig.projectId,
      token: this.doguConfig.token,
      remoteDeviceJobId,
    };
    return new RemoteDestHandler(options);
  }
}
