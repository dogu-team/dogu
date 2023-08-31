import { DeviceCloser } from '../bases.js';

export class AppiumContextServerInfo {
  constructor(public readonly port: number) {}
}

export class AppiumServerContext {
  constructor(public readonly info: AppiumContextServerInfo, public readonly closer: DeviceCloser) {}

  get port(): number {
    return this.info.port;
  }

  async close(): Promise<void> {
    await this.closer.close();
  }
}
