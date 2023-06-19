import { delay, loop } from '@dogu-tech/common';
import { findFreePorts, isFreePort } from 'find-free-ports';

const startPort = 20000;
const endPort = 60000;

const usedportToAccessTime: Map<number, number> = new Map();

export async function getFreePort(excludes: number[] = [], offset = 0): Promise<number> {
  for await (const _ of loop(1000)) {
    cleanUpUsedPorts();
    const mergedExcludes = excludes.concat(...usedportToAccessTime.keys());

    const frees = await findFreePorts(mergedExcludes.length + 1, { startPort: startPort + offset, endPort });
    const excludeds = frees.filter((port) => !mergedExcludes.includes(port));
    if (excludeds.length === 0) {
      throw Error('getFreePort. there is no port available');
    }
    for (const excluded of excludeds) {
      if (usedportToAccessTime.has(excluded)) {
        continue;
      }
      usedportToAccessTime.set(excluded, Date.now());
      return excluded;
    }
  }
  throw Error('getFreePort. failed to get free port');
}

function cleanUpUsedPorts(): void {
  const now = Date.now();
  usedportToAccessTime.forEach((usedPort, accessTime) => {
    if (now - accessTime > 30000) {
      usedportToAccessTime.delete(usedPort);
    }
  });
}

export async function waitPortOpen(port: number, timeout = 10000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (!(await isFreePort(port))) {
      return;
    }
    await delay(100);
  }
  throw Error(`waitPortOpen. port:${port} is not open`);
}
