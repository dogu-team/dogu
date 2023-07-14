import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { DoguLogger } from '../../logger/logger';

@Injectable()
export class RemoteSystemProcessor {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    // FIXME: henry - duplicated key with HeartbeatSystemProcessor
    // @Inject(RemoteDeviceJobUpdater) private readonly remoteDeviceJobUpdater: RemoteDeviceJobUpdater,
    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    await this.updateConnection().catch((error) => {
      this.logger.error(error);
    });
  }

  // FIXME: henry - duplicated key with HeartbeatSystemProcessor
  private async updateConnection(): Promise<void> {
    // const value = await this.redis.lpop(config.redis.key.updateConnection);
    // if (value === null) {
    //   return;
    // }
    // await this.remoteDeviceJobUpdater.update();
  }
}
