import { Serial } from '@dogu-private/types';
import { SerialPrintable } from '../../../../logger/serial-logger.instance';
import { delay } from '../../../util/delay';
import * as Adb from './adb';

export async function waitPortOpenInternal(serial: Serial, port: number, printable: SerialPrintable): Promise<void> {
  for (let i = 0; i < 10; ++i) {
    if (await Adb.isPortOpen(serial, port, printable)) return;
    await delay(1000);
  }

  throw new Error('adbUtil.waitPortOpen timeout');
}
