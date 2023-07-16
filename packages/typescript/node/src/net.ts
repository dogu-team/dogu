import { delay } from '@dogu-tech/common';
import net from 'net';

export function isFreePort(port: number): Promise<boolean> {
  return new Promise((accept, reject) => {
    const sock = net.connect({ host: '127.0.0.1', port: port });
    sock.once('connect', () => {
      sock.end();
      accept(false);
    });
    sock.once('error', (e: NodeJS.ErrnoException) => {
      sock.destroy();
      if (e.code === 'ECONNREFUSED') {
        accept(true);
      } else {
        reject();
      }
    });
  });
}

export async function waitPortOpen(port: number, timeout = 10000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const isFree = await isFreePort(port).catch(() => true);
    if (!isFree) {
      return;
    }
    await delay(300);
  }
  throw Error(`waitPortOpen. port:${port} is not open`);
}

export async function waitPortIdle(port: number, timeout = 10000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const isFree = await isFreePort(port).catch(() => true);
    if (isFree) {
      return;
    }
    await delay(300);
  }
  throw Error(`waitPortIdle. port:${port} is not idle `);
}
