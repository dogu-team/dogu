import { findFreePorts } from 'find-free-ports';
import * as net from 'net';

const startPort = 20000;
const endPort = 60000;
const accessBlockTime = 3 * 60 * 1000;
const usedportToAccessTime: Map<number, number> = new Map();

export async function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function* loop(delayMilliseconds: number, count = Infinity): AsyncGenerator<void> {
  for (let i = 0; ; ) {
    if (count !== Infinity) {
      if (!(i < count)) {
        break;
      }
    }
    yield;
    await delay(delayMilliseconds);
    if (count !== Infinity) {
      i++;
    }
  }
}

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

export async function getFreePort(excludes: number[] = [], offset = 0): Promise<number> {
  for await (const _ of loop(1000)) {
    cleanUpUsedPorts();
    const mergedExcludes = excludes.concat(...usedportToAccessTime.keys());

    const frees = await findFreePorts(mergedExcludes.length + 1, { startPort: startPort + offset, endPort, isFree: isFreePort });
    const filteredPorts = frees.filter((port) => !mergedExcludes.includes(port));
    if (filteredPorts.length === 0) {
      throw Error('getFreePort. there is no port available');
    }
    for (const port of filteredPorts) {
      if (usedportToAccessTime.has(port)) {
        continue;
      }
      usedportToAccessTime.set(port, Date.now());
      return port;
    }
  }
  throw Error('getFreePort. failed to get free port');
}

function cleanUpUsedPorts(): void {
  const now = Date.now();
  usedportToAccessTime.forEach((usedPort, accessTime) => {
    if (now - accessTime > accessBlockTime) {
      usedportToAccessTime.delete(usedPort);
    }
  });
}
