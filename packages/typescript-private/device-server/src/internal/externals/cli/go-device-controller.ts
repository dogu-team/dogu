import { Platform } from '@dogu-private/types';
import { errorify, FilledPrintable, Printable, stringify } from '@dogu-tech/common';
import { ChildProcess, killChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import fs from 'fs';
import { registerBootstrapHandler } from '../../../bootstrap/bootstrap.service';
import { pathMap } from '../../../path-map';
import { config } from '../../config';
import { Zombieable, ZombieProps, ZombieWaiter } from '../../services/zombie/zombie-component';
import { ZombieServiceInstance } from '../../services/zombie/zombie-service';
import { getFreePort } from '../../util/net';

export class GoDeviceControllerProcess implements Zombieable {
  private zombieWaiter: ZombieWaiter;
  private proc: child_process.ChildProcess | null = null;

  constructor(public readonly platform: Platform, public readonly port: number, public readonly deviceServerPort: number, private readonly logger: FilledPrintable) {
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
  }

  static async create(platform: Platform, deviceServerPort: number, logger: FilledPrintable): Promise<GoDeviceControllerProcess> {
    let port = 0;
    if (config.externalPionStreamer.use) {
      port = config.externalPionStreamer.port;
    } else {
      port = await getFreePort();
    }
    const ret = new GoDeviceControllerProcess(platform, port, deviceServerPort, logger);
    await ret.zombieWaiter.waitUntilAlive();
    return ret;
  }

  // Zombie
  get name(): string {
    return `GoDeviceControllerProcess`;
  }

  get props(): ZombieProps {
    return { isExternal: config.externalPionStreamer.use, port: this.port };
  }
  get printable(): Printable {
    return this.logger;
  }
  get serial(): string {
    return '';
  }

  async revive(): Promise<void> {
    if (config.externalPionStreamer.use) {
      return;
    }
    this.proc = startServer(this.port, this.deviceServerPort, this.logger);
    this.proc.on('close', (code: number, signal: string) => {
      this.logger.verbose('PionStreamingService.revive exit');
      ZombieServiceInstance.notifyDie(this, 'ChildProcess close');
    });
    await Promise.resolve();
  }

  onDie(): void {
    if (this.proc) {
      killChildProcess(this.proc).catch((e) => {
        const error = errorify(e);
        this.logger.error('PionStreamingService.onDie killChildProcess error', { error });
      });
    }
  }
}

export function startServer(port: number, deviceServerPort: number, printable: Printable): child_process.ChildProcess {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ChildProcess.spawnSync(
    pathMap().common.goDeviceController,
    [`--grpcServerPort=${port}`, `--deviceServerPort=${deviceServerPort}`, `--ffmpegPath=${pathMap().common.ffmpeg}`],
    {},
    printable,
  );
}

registerBootstrapHandler(__filename, async (): Promise<void> => {
  try {
    await fs.promises.chmod(pathMap().common.goDeviceController, 0o777);
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(stringify(error));
    throw new Error(`Failed to chmod ${pathMap().common.goDeviceController}}`, { cause });
  }
});
