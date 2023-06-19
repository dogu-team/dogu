import c from 'ansi-colors';
import { ChildProcessWithoutNullStreams } from 'child_process';

import { Utils } from './utils';

export module Timer {
  const timers: { [name: string]: NodeJS.Timeout } = {};

  export function close(): void {
    for (const timerName in timers) {
      deallocateTimer(timerName);
    }
  }

  function allocateTimer(timer: NodeJS.Timeout, name: string): void {
    if (timers[name]) {
      throw new Error(`${name} timer already exists`);
    }

    timers[name] = timer;
  }

  function deallocateTimer(name: string): void {
    if (timers[name] === undefined) {
      throw new Error(`${name} timer does not exist`);
    }

    clearTimeout(timers[name]);
    delete timers[name];
  }

  export function wait(ms: number, name: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        deallocateTimer(name);
        resolve();
      }, ms);

      allocateTimer(timeout, name);
    });
  }

  export function clearWait(name: string): void {
    deallocateTimer(name);
  }

  export function waitStream(stream: ChildProcessWithoutNullStreams, condition: string, timeout: number): Promise<void> {
    const randomId = Utils.random().toString();
    let isCleared = false;

    return new Promise((resolve, reject) => {
      function onData(data: any): void {
        const transformed = data instanceof Buffer ? data.toString() : String(data);
        const filtered = c.unstyle(transformed);
        if (filtered.includes(condition)) {
          if (!isCleared) {
            clearWait(randomId);
            isCleared = true;
          }

          resolve();
        }
      }

      function onError(error: Error): void {
        if (!isCleared) {
          clearWait(randomId);
          isCleared = true;
        }

        reject(error);
      }

      wait(timeout, randomId)
        .then(() => {
          isCleared = true;
          reject('wait stream timeout');
        })
        .catch((error) => {
          reject(error);
        });

      stream.stdout.on('data', onData);
      stream.stderr.on('data', onData);
      stream.stdout.on('error', onError);
      stream.stderr.on('error', onError);
    });
  }
}
