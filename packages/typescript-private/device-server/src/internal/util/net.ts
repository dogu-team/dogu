import { delay, loop, NullLogger, Printable } from '@dogu-tech/common';
import { ChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import { findFreePorts } from 'find-free-ports';
import net from 'net';

const startPort = 20000;
const endPort = 60000;
const accessBlockTime = 3 * 60 * 1000;

const usedportToAccessTime: Map<number, number> = new Map();

export async function getFreePort(excludes: number[] = [], offset = 0): Promise<number> {
  for await (const _ of loop(1000)) {
    cleanUpUsedPorts();
    const mergedExcludes = excludes.concat(...usedportToAccessTime.keys());

    const frees = await findFreePorts(mergedExcludes.length + 1, { startPort: startPort + offset, endPort });
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

export async function killProcessOnPortOnMacos(includes: string, port: number, printable: Printable): Promise<void> {
  const lsofResult = await ChildProcess.execIgnoreError(`lsof -i :${port} | grep LISTEN | grep ${includes}`, { timeout: 10000 }, new NullLogger());
  if (0 === lsofResult.stdout.length) {
    return;
  }

  const splited = lsofResult.stdout.split(/\s+/);
  if (0 === splited.length) {
    return;
  }
  const pid = splited[1];
  if (!pid) {
    return;
  }
  child_process.execSync(`kill -9 ${pid}`);
}
