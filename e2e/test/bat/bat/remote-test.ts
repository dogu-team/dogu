import { job } from '@dogu-tech/dest';
import { PlaywrightDriver } from '../../../src/playwright-driver';

// async function spawnExec(command: string): Promise<void> {
//   await new Promise((resolve, reject) => {
//     const child = spawn(command, { shell: true });
//     const onErrorForReject = (error: Error) => {
//       reject(error);
//     };
//     child.on('error', onErrorForReject);
//     child.on('spawn', () => {
//       child.off('error', onErrorForReject);
//       child.on('error', (error: Error) => {
//         console.error(`Error on command: ${command}`);
//       });
//     });
//   });
// }

export interface TestRemoteOptions {
  consoleFrontDriver: PlaywrightDriver;
}

export default function testRemote(options: TestRemoteOptions): void {
  job('Remote test', () => {
    test('Checkout dogu-examples', async () => {});
  });
}
