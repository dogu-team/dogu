import { Platform } from '@dogu-private/types';
import { AppiumChannel } from './appium.channel';
import { AppiumService } from './appium.service';
import AsyncLock from 'async-lock';
import { AppiumChannelKey } from '@dogu-tech/device-client-common';

const LockKey = 'AppiumChannel';

export class AppiumChannelProxy {
  private readonly map = new Map<AppiumChannelKey, AppiumChannel>();
  private readonly lock = new AsyncLock();

  constructor(private readonly appiumService: AppiumService, private readonly platform: Platform, private readonly serial: string) {}

  async close(): Promise<void> {
    const values = await this.lock.acquire(LockKey, () => {
      const values = Array.from(this.map.values());
      this.map.clear();
      return values;
    });
    const promises = values.map((channel) => channel.close());
    await Promise.all(promises);
  }

  async get(key: AppiumChannelKey): Promise<AppiumChannel> {
    return this.lock.acquire(LockKey, async () => {
      const channel = this.map.get(key);
      if (!channel) {
        const { platform, serial } = this;
        const channel = await this.appiumService.createAppiumChannel(platform, serial, key);
        this.map.set(key, channel);
        return channel;
      }
      return channel;
    });
  }
}
