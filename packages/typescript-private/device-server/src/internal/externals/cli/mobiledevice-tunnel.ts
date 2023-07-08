import { Platform, Serial } from '@dogu-private/types';
import { delay, Printable } from '@dogu-tech/common';
import { ChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import { idcLogger, logger } from '../../../logger/logger.instance';
import { Zombieable, ZombieProps, ZombieWaiter } from '../../services/zombie/zombie-component';
import { ZombieServiceInstance } from '../../services/zombie/zombie-service';
import { killProcessOnPortOnMacos } from '../../util/net';
import { MobileDevice } from './mobiledevice';

export class TunnelContext {
  public isAlive = true;
  private logs = '';
  constructor(public readonly proc: child_process.ChildProcess, private readonly hostPort: number, private readonly devicePort: number) {
    proc.stdout?.on('data', (data) => {
      const str = String(data);
      logger.debug('TunnelContext stdout', { hostPort: this.hostPort, devicePort: this.devicePort, data: str });
      this.logs += str;
      this.checkLog();
      if (!this.isAlive) {
        proc.kill();
      }
    });

    proc.stderr?.on('data', (data) => {
      const str = String(data);
      logger.debug('TunnelContext stderr', { data: str });
      this.logs += str;
      this.checkLog();
      if (!this.isAlive) {
        proc.kill();
      }
    });

    proc.on('exit', (code, signal) => {
      logger.debug('TunnelContext exit', { hostPort: this.hostPort, devicePort: this.devicePort, code, signal });
    });
  }
  public kill(): void {
    this.proc.kill();
  }

  public async ping(hostPort: number): Promise<child_process.ChildProcess> {
    delay(1000);
    return await ChildProcess.spawnAndWait('nc', ['-z', 'localhost', `${hostPort}`], {}, idcLogger);
  }

  private checkLog(): void {
    if (this.logs.includes('Device refused connection') || this.logs.includes('Closing tunnel...')) {
      this.isAlive = false;
    }
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(1000);
    }
  }
}

export class ZombieTunnel implements Zombieable {
  private tunnelContext: TunnelContext | null = null;
  public readonly zombieWaiter: ZombieWaiter;
  constructor(public readonly serial: Serial, readonly hostPort: number, readonly devicePort: number, private readonly logger: Printable) {
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
  }

  get name(): string {
    return `Tunnel`;
  }
  get platform(): Platform {
    return Platform.PLATFORM_IOS;
  }
  get props(): ZombieProps {
    return { hostPort: this.hostPort, devicePort: this.devicePort };
  }
  get printable(): Printable {
    return this.logger;
  }

  async revive(): Promise<void> {
    await killProcessOnPortOnMacos('mobile', this.hostPort);
    await delay(1000);
    this.tunnelContext = MobileDevice.tunnel(this.serial, this.hostPort, this.devicePort, this.printable);
    if (!this.tunnelContext) {
      throw new Error('tunnelContext is null');
    }
    this.tunnelContext.proc.on('exit', () => {
      ZombieServiceInstance.notifyDie(this);
    });
    return Promise.resolve();
  }

  async update(): Promise<void> {
    if (!this.tunnelContext) {
      ZombieServiceInstance.notifyDie(this);
      return;
    }
    if (this.tunnelContext && !this.tunnelContext.isAlive) {
      ZombieServiceInstance.notifyDie(this);
    }
    return Promise.resolve();
  }

  onDie(): void {
    this.tunnelContext?.kill();
  }
}
