import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { config } from '../../../config';
import { DoguLogger } from '../../logger/logger';
import { RemoteDeviceJobUpdater } from './remote-device-job-updater';

@Injectable()
export class RemoteSystemProcessor {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    @Inject(RemoteDeviceJobUpdater) private readonly remoteDeviceJobUpdater: RemoteDeviceJobUpdater,
    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    await this.updateConnection().catch((error) => {
      this.logger.error(error);
    });
  }
  private async updateConnection(): Promise<void> {
    const value = await this.redis.lpop(config.redis.key.updateConnection);
    if (value === null) {
      return;
    }
    await this.remoteDeviceJobUpdater.update();
  }
}
