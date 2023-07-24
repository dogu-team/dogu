import { loop } from '@dogu-tech/common';
import { isFreePort } from '@dogu-tech/node';
import { findFreePorts } from 'find-free-ports';

const startPort = 20000;
const endPort = 60000;
const accessBlockTime = 3 * 60 * 1000;

const usedportToAccessTime: Map<number, number> = new Map();

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
