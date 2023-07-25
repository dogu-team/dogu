export interface ProcessInfo {
  ppid: number;
  pid: number;
  mem: number;
  commandLine: string;
  cpuUsedTime: string;
}

export function DefaultProcessInfo(): ProcessInfo {
  return {
    ppid: 0,
    pid: 0,
    mem: 0,
    commandLine: '',
    cpuUsedTime: '',
  };
}
