// import { Platform } from '@dogu-private/types';
// import { Printable } from '@dogu-tech/common';
// import child_process from 'child_process';
// import { idcLogger } from '../../../logger/logger.instance';
// import { config } from '../../config';
// import { Zombieable, ZombieProps, ZombieWaiter } from '../../services/zombie/zombie-component';
// import { ZombieServiceInstance } from '../../services/zombie/zombie-service';
// import { getFreePort } from '../../util/net';

// export class IosDeviceControllerProcess implements Zombieable {
//   private zombieWaiter: ZombieWaiter;
//   private proc: child_process.ChildProcess | null = null;

//   constructor(public readonly port: number) {
//     this.zombieWaiter = ZombieServiceInstance.addComponent(this);
//   }

//   static async create(): Promise<IosDeviceControllerProcess> {
//     // henry: comment out temporarily
//     // await fs.promises.chmod(pathMap().macos.iosDeviceController, 0o777);

//     let port = 0;
//     if (config.externalIosDeviceController.use) {
//       port = config.externalIosDeviceController.port;
//     } else {
//       const hashModuloed = process.pid % 100;
//       port = await getFreePort([], hashModuloed);
//     }
//     const ret = new IosDeviceControllerProcess(port);
//     await ret.zombieWaiter.waitUntilAlive();

//     return ret;
//   }

//   // Zombie

//   get parent(): Zombieable | null {
//     return null;
//   }
//   get name(): string {
//     return 'IosDeviceControllerProcess';
//   }
//   get platform(): Platform {
//     return Platform.PLATFORM_IOS;
//   }
//   get serial(): string {
//     return '';
//   }
//   get props(): ZombieProps {
//     return { isExternal: config.externalIosDeviceController.use, port: this.port };
//   }
//   get printable(): Printable {
//     return idcLogger;
//   }

//   async revive(): Promise<void> {
//     if (config.externalIosDeviceController.use) {
//       return;
//     }
//     // henry: comment out temporarily
//     // this.proc = ChildProcess.spawnSync(pathMap().macos.iosDeviceController, [`--grpc-port=${this.port}`, '--log-stdout'], {}, idcLogger);
//     // this.proc.on('close', (code: number, signal: string) => {
//     //   idcLogger.verbose('IosDeviceControllerProcess.revive exit');
//     //   this.notifyDie(this.zombie);
//     // });
//     await Promise.resolve();
//   }

//   onDie(): void {
//     this.proc?.kill();
//   }
// }
