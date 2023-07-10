import { NullLogger, Printable } from '@dogu-tech/common';
import { ChildProcess } from '.';

export async function killProcessOnPort(port: number, printable: Printable): Promise<void> {
  switch (process.platform) {
    case 'darwin':
      await killProcessOnPortOnMacos('', port, printable);
      break;
    case 'win32':
      await killProcessOnPortOnWindows(port, printable);
      break;
    default:
      printable.warn?.(`killProcessOnPort. platform:${process.platform} is not supported`);
      return;
  }
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
  await ChildProcess.execIgnoreError(`kill -9 ${pid}`, { timeout: 10000 }, new NullLogger());
}

export async function killProcessOnPortOnWindows(port: number, printable: Printable): Promise<void> {
  const naoResult = await ChildProcess.execIgnoreError(`netstat -nao`, { timeout: 10000 }, new NullLogger());
  if (0 === naoResult.stdout.length) {
    return;
  }
  const lines = naoResult.stdout.split(/\r?\n/).map((line) => {
    const [protocol, localAddr, externalAddr, state, pid] = line.trim().split(/\s{1,}|\t/);
    return {
      protocol,
      localAddr,
      externalAddr,
      state,
      pid,
    };
  });
  const listenings = lines.filter(
    (line) => line.state === 'LISTENING' && line.localAddr.includes(`:${port}`) && (line.localAddr.startsWith('0.0.0.0') || line.localAddr.startsWith('127.0.0.1')), // ipv4
  );
  if (0 === listenings.length) {
    return;
  }
  await ChildProcess.execIgnoreError(`TaskKill /F /PID ${listenings.map((line) => line.pid).join(' /PID ')}`, { timeout: 10000 }, new NullLogger());
}
