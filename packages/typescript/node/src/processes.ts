import { NullLogger, Printable, ProcessInfo } from '@dogu-tech/common';
import pidtree from 'pidtree';
import { ChildProcess, killProcess, waitPortIdle } from '.';

export type Pid = string | number;

export async function killProcessOnPort(port: number, printable: Printable): Promise<void> {
  switch (process.platform) {
    case 'darwin':
      await killProcessOnPortOnMacos('""', port, printable);
      await waitPortIdle(port);
      break;
    case 'win32':
      await killProcessOnPortOnWindows(port, printable);
      await waitPortIdle(port);
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
  killProcess(pid);
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
  for (const line of listenings) {
    killProcess(line.pid);
  }
}

type ProcessInfoDict = Map<number, ProcessInfo>;

export async function getProcessesMap(logger: Printable): Promise<ProcessInfoDict> {
  switch (process.platform) {
    case 'darwin':
      return await getProcessesMapMacos(logger);
    case 'win32':
      return await getProcessesMapWindows(logger);
    default:
      return new Map();
  }
}

export async function getProcessesMapMacos(logger: Printable): Promise<ProcessInfoDict> {
  const psResult = await ChildProcess.execIgnoreError('ps -axo pid,ppid,rss,time,command', { timeout: 3000 }, logger);
  const lines = psResult.stdout.split('\n');
  const infos = lines.map((line) => {
    const [pid, ppid, rss, time, ...command] = line.trim().split(/\s{1,}|\t/);
    return { ppid: parseInt(ppid), pid: parseInt(pid), cpuUsedTime: time, mem: parseInt(rss) * 1024, commandLine: command.join(' ') } as ProcessInfo;
  });
  return new Map(infos.map((info) => [info.pid, info]));
}

export async function getProcessesMapWindows(logger: Printable): Promise<ProcessInfoDict> {
  const psResult = await ChildProcess.execIgnoreError('wmic process get CommandLine, ParentProcessId, ProcessId, WorkingSetSize', { timeout: 3000 }, logger);
  const lines = psResult.stdout.split('\n').filter((line) => line.trim().length > 0);
  const infos = lines.map((line) => {
    const splited = line.trim().split(/\s{1,}|\t/);
    const command = splited.slice(0, splited.length - 3);
    const [ppid, pid, workmem] = splited.slice(splited.length - 3);
    return { ppid: parseInt(ppid), pid: parseInt(pid), cpuUsedTime: '', mem: parseInt(workmem), commandLine: command.join(' ') } as ProcessInfo;
  });
  return new Map(infos.map((info) => [info.pid, info]));
}

export async function getChildProcessIds(pid: Pid, printable: Printable): Promise<Pid[]> {
  return new Promise((resolve) => {
    pidtree(pid, (err, pids) => {
      if (err) {
        printable.error('child process close. pidtree error', { error: err });
        resolve([]);
      } else {
        printable.info('child process close. pidtree', { pids });
        resolve(pids);
      }
    });
  });
}
