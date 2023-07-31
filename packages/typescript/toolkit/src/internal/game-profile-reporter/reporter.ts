import { Closable, DefaultHttpOptions, errorify, Instance, Printable, setAxiosErrorFilterToGlobal } from '@dogu-tech/common';
import { PublicDevice } from '@dogu-tech/console-gamium';
import { createConsoleApiAuthHeader, platformFromPlatformType } from '@dogu-tech/types';
import axios from 'axios';
import { GamiumClient } from 'gamium/common';
import { GameProfileReporterOptions } from './options';

export interface GameProfileReporter {
  open(): Closable;
}

export class NullGameProfileReportCloser implements Closable {
  close(): void {
    // noop
  }
}

export class NullGameProfileReporter implements GameProfileReporter {
  open(): Closable {
    return new NullGameProfileReportCloser();
  }
}

export class GameProfileReportCloser implements Closable {
  private timer: NodeJS.Timer | null = null;

  constructor(timer: NodeJS.Timer) {
    this.timer = timer;
  }

  close(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export class GameProfileReporterImpl implements GameProfileReporter {
  constructor(private readonly gamiumClient: GamiumClient, private readonly options: Required<GameProfileReporterOptions>, private readonly printable: Printable) {}

  open(): Closable {
    const { options, printable } = this;
    const { requestInterval } = options;
    if (!this.gamiumClient.connected) {
      throw new Error('Gamium is not connected');
    }
    const timer = setInterval(() => {
      this.profile(options, printable).catch((error) => {
        printable.error('Failed to profile game', { error: errorify(error) });
      });
    }, requestInterval);
    printable.info('Started', { requestInterval });
    return new GameProfileReportCloser(timer);
  }

  private async profile(options: Required<GameProfileReporterOptions>, printable: Printable): Promise<void> {
    const { organizationId, apiBaseUrl, deviceId, devicePlatform, hostToken } = options;
    if (!this.gamiumClient.connected) {
      printable.info('Gamium is not connected');
      return;
    }
    const profileResult = await this.gamiumClient.profile();
    const pathProvider = new PublicDevice.writeGameRunTimeInfos.pathProvider(organizationId, deviceId);
    const path = PublicDevice.writeGameRunTimeInfos.resolvePath(pathProvider);
    const requestBody: Instance<typeof PublicDevice.writeGameRunTimeInfos.requestBody> = {
      gameRuntimeInfos: [
        {
          ...profileResult,
          platform: platformFromPlatformType(devicePlatform),
          localTimeStamp: new Date(),
        },
      ],
    };
    const url = `${apiBaseUrl}${path}`;
    setAxiosErrorFilterToGlobal();
    await axios.post(url, requestBody, {
      ...createConsoleApiAuthHeader(hostToken),
      timeout: DefaultHttpOptions.request.timeout,
    });
    printable.info('Profiled game', { url, requestBody });
  }
}
