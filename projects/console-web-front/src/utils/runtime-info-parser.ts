import { RuntimeInfo } from '@dogu-private/types';
import { GameRuntimeInfo } from '@dogu-tech/console-gamium';
import moment from 'moment';
import { convertByteToGigaByte } from './unit';

export type CpuUsageInfo = {
  timestamp: string | number;
  system: number;
  user: number;
  foreground?: number;
  foregroundProcName?: string;
};

export type MemoryUsageInfo = {
  timestamp: string | number;
  total: string;
  used: string;
  foreground?: string;
  foregroundProcName?: string;
};

export type GameFpsInfo = {
  timestamp: string | number;
  fps: number;
};

export type DurationOptionType = {
  duration: true;
  startedAt: Date;
};

export type ParseOptions = DurationOptionType | { duration: false };

export class DeviceRuntimeInfoParser {
  private locale: string | undefined = 'ko';

  constructor({ locale }: { locale: string | undefined }) {
    this.locale = locale;
  }

  parseCpuUsage(infos: RuntimeInfo[], options?: ParseOptions): CpuUsageInfo[] {
    const cpuUsageInfos: CpuUsageInfo[] = infos
      .filter((info) => info.cpues.length > 0)
      .map((item) => {
        const timestamp = options?.duration
          ? this.getDurationAsMilliseconds(options.startedAt, item.localTimeStamp ?? new Date())
          : this.localizeDate(item.localTimeStamp ? moment(item.localTimeStamp).toDate() : new Date());
        const cpuInfo = item.cpues?.[0];

        const cores = Math.trunc(cpuInfo.currentLoadCpu / 100);
        const sysInfo = Math.round(((cpuInfo.currentLoadSystem * 100) / cpuInfo.currentLoadCpu) * 1e2) / 1e2;
        const userInfo = Math.round((((cpuInfo.currentLoadUser + cpuInfo.currentLoadNice) * 100) / cpuInfo.currentLoadCpu) * 1e2) / 1e2;
        const foregroundProc = item.processes.find((item) => item.isForeground);

        if (cores === 0) {
          return {
            timestamp,
            system: 0,
            user: 0,
          };
        }

        if (foregroundProc) {
          return {
            timestamp,
            system: sysInfo,
            user: userInfo,
            foreground: Math.round((foregroundProc.cpues?.[0]?.percent / cores) * 1e2) / 1e2,
            foregroundProcName: foregroundProc.name,
          };
        }

        return {
          timestamp,
          system: sysInfo,
          user: userInfo,
        };
      });

    return cpuUsageInfos;
  }

  parseMemoryUsage(infos: RuntimeInfo[], options?: ParseOptions): MemoryUsageInfo[] {
    const memInfos: MemoryUsageInfo[] = infos
      .filter((info) => info.mems.length > 0)
      .map((item) => {
        const memInfo = item.mems?.[0];
        const timestamp = options?.duration
          ? this.getDurationAsMilliseconds(options.startedAt, item.localTimeStamp ?? new Date())
          : this.localizeDate(item.localTimeStamp ? moment(item.localTimeStamp).toDate() : new Date());

        const foregroundProc = item.processes.find((item) => item.isForeground);

        if (foregroundProc) {
          return {
            timestamp,
            total: convertByteToGigaByte(memInfo.total),
            used: convertByteToGigaByte(memInfo.total - memInfo.available),
            foreground: convertByteToGigaByte(memInfo.total * (foregroundProc.mems?.[0]?.percent / 100)),
            foregroundProcName: foregroundProc.name,
          };
        }

        return {
          timestamp,
          total: convertByteToGigaByte(memInfo.total),
          used: convertByteToGigaByte(memInfo.total - memInfo.available),
        };
      });

    return memInfos;
  }

  parseFps(infos: GameRuntimeInfo[], options?: ParseOptions): GameFpsInfo[] {
    const fpsInfos: GameFpsInfo[] = infos.map((item) => {
      const timestamp = options?.duration
        ? this.getDurationAsMilliseconds(options.startedAt, item.localTimeStamp ?? new Date())
        : this.localizeDate(item.localTimeStamp ? moment(item.localTimeStamp).toDate() : new Date());

      return {
        fps: item.fps,
        timestamp,
      };
    });

    return fpsInfos;
  }

  /**
   * Create duration x axis domains
   * @param startedAt
   * @param endedAt
   * @param tick default 10000(10s)
   * @returns
   */
  getDurationXAxisDomains(startedAt: Date, endedAt: Date, tick: number = 10000): number[] {
    const duration = moment.duration(moment(endedAt).diff(moment(startedAt)));

    if (duration.asMilliseconds() < tick) {
      return [0, duration.asMilliseconds()];
    }

    // ex) duration 8m 30s => ["0", "10s", "20s", ..., "8m 20s", "8m 30s"]
    const domains: number[] = [0];
    const totalMilliSeconds = duration.asMilliseconds();

    for (let i = tick; i <= totalMilliSeconds; i += tick) {
      domains.push(i);
    }

    if (domains[domains.length - 1] !== totalMilliSeconds) {
      domains.push(totalMilliSeconds);
    }

    return domains;
  }

  private localizeDate(date: Date): string {
    return Intl.DateTimeFormat(this.locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);
  }

  private getDurationAsMilliseconds(start: Date, now: Date): number {
    const duration = moment.duration(moment(now).diff(moment(start)));
    return duration.asMilliseconds();
  }
}
