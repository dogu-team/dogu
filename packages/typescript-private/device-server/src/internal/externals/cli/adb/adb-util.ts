import { Serial } from '@dogu-private/types';
import { delay } from '../../../util/delay';
import * as Adb from './adb';

export async function waitPortOpenInternal(serial: Serial, port: number): Promise<void> {
  for (let i = 0; i < 10; ++i) {
    if (await Adb.isPortOpen(serial, port)) return;
    await delay(1000);
  }

  throw new Error('adbUtil.waitPortOpen timeout');
}
