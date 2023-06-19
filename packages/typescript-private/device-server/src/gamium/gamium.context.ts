import { categoryFromPlatform, platformTypeFromPlatform } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { ContextPageSource } from '@dogu-tech/device-client-common';
import { Logger } from '@dogu-tech/node';
import { GamiumClient, NodeGamiumService } from 'gamium';
import lodash from 'lodash';
import { setInterval } from 'timers/promises';
import { DeviceChannel } from '../internal/public/device-channel';
import { getFreePort } from '../internal/util/net';
import { createGamiumLogger } from '../logger/logger.instance';

export type GamiumContextPageSource = Pick<ContextPageSource, 'context' | 'pageSource'>;

export interface GamiumContextOptions {
  /**
   * @default 50061
   * @description The port of gamium engine.
   */
  gamiumEnginePort?: number;

  /**
   * @default 3
   * @description The number of retries to connect to gamium engine.
   */
  connectRetryCount?: number;

  /**
   * @default 60000
   * @description Timeout for request to gamium engine.
   */
  requestTimeout?: number;
}

function defaultGamiumContextOptions(): Required<GamiumContextOptions> {
  return {
    gamiumEnginePort: 50061,
    connectRetryCount: 3,
    requestTimeout: 60000,
  };
}

function isDifferentOptions(a: GamiumContextOptions, b: GamiumContextOptions): boolean {
  return a.gamiumEnginePort !== b.gamiumEnginePort || a.connectRetryCount !== b.connectRetryCount || a.requestTimeout !== b.requestTimeout;
}

interface PortUnforwarder {
  close(): Promise<void>;
}

export class GamiumContext {
  private logger: Logger;
  private options = defaultGamiumContextOptions();

  private portUnforwarder: PortUnforwarder | null = null;
  private gamiumClient: GamiumClient | null = null;

  get connected(): boolean {
    return this.gamiumClient?.connected ?? false;
  }

  constructor(private readonly channel: DeviceChannel, options?: GamiumContextOptions) {
    this.logger = createGamiumLogger(channel.serial);
    this.options = lodash.merge(this.options, options);
  }

  open(): void {
    this.loopCheckDisconnect().catch((error) => {
      this.logger.error('Gamium loopCheckDisconnect failed', { error: errorify(error) });
    });
  }

  async loopCheckDisconnect(): Promise<void> {
    for await (const _ of setInterval(3 * 1000)) {
      try {
        if (!this.gamiumClient) {
          continue;
        }
        if (!this.gamiumClient.connected) {
          this.logger.warn('Gamium disconnected');
          await this.clear();
        }
      } catch (error) {
        this.logger.error('Gamium loopCheckDisconnect failed', { error: errorify(error) });
      }
    }
  }

  async close(): Promise<void> {
    await this.disconnect();
  }

  async update(options?: GamiumContextOptions): Promise<boolean> {
    try {
      if (options && isDifferentOptions(this.options, options)) {
        this.options = lodash.merge(this.options, options);
        if (this.connected) {
          await this.reconnect();
          return true;
        }
      }
      return false;
    } catch (error) {
      this.logger.error('Gamium update failed', { error: errorify(error) });
      return false;
    }
  }

  private async clear(): Promise<void> {
    await this.disconnect();
  }

  private async disconnect(): Promise<void> {
    if (this.gamiumClient) {
      this.gamiumClient.disconnect();
      this.gamiumClient = null;
    }
    if (this.portUnforwarder) {
      await this.portUnforwarder.close();
      this.portUnforwarder = null;
    }
  }

  async reconnect(): Promise<void> {
    await this.disconnect();
    const { gamiumEnginePort, requestTimeout, connectRetryCount } = this.options;
    const platform = platformTypeFromPlatform(this.channel.platform);
    let targetPort: number | null = null;
    if (categoryFromPlatform(platform) === 'mobile') {
      const triedHostPorts: number[] = [];
      const hostPort = await getFreePort(triedHostPorts);
      triedHostPorts.push(hostPort);
      await this.channel.forward(hostPort, gamiumEnginePort, this.logger);
      this.portUnforwarder = {
        close: (): Promise<void> => {
          return Promise.resolve(this.channel.unforward(hostPort));
        },
      };
      targetPort = hostPort;
    } else {
      targetPort = gamiumEnginePort;
    }
    if (!targetPort) {
      throw new Error('Target port is null');
    }
    const gamiumService = new NodeGamiumService('127.0.0.1', targetPort, requestTimeout, this.logger);
    this.gamiumClient = new GamiumClient(gamiumService, this.logger);
    await this.gamiumClient.connect(connectRetryCount);
  }

  async getPageSource(): Promise<string> {
    return this.gamiumClient?.inspector().getPageSource() ?? '';
  }

  private createContextPageSource(pageSource: string): GamiumContextPageSource {
    return {
      context: 'GAMIUM',
      pageSource,
    };
  }

  async getContextPageSource(): Promise<GamiumContextPageSource> {
    const pageSource = await this.getPageSource();
    return this.createContextPageSource(pageSource);
  }
}
