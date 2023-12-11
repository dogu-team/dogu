import { ProfileMethod, ProfileMethodKind, RuntimeInfo, Serial } from '@dogu-private/types';
import { FilledPrintable, loop } from '@dogu-tech/common';
import { AppiumContext } from '../../../appium/appium.context';
import { AdbSerial, FocusedAppInfo } from '../../externals/cli/adb/adb';
import { AndroidPropInfo, AndroidShellTopInfo, AndroidShellTopProcInfo, DefaultAndroidPropInfo, DefaultAndroidShellTopInfo } from '../../externals/index';
import { AndroidDeviceAgentService } from '../device-agent/android-device-agent-service';
import { BlockDeveloperOptionsProfiler } from './android-block-dev-profiler';
import { ProfileService } from './profile-service';

interface QueryContext<T> {
  name: string;
  querying: boolean;
  info: T | undefined;
  func: () => Promise<T>;
  default: T;
}

export class AndroidAdbProfileContext {
  private shellTopInfoContext: QueryContext<AndroidShellTopInfo>;
  private focusedAppInfosContext: QueryContext<FocusedAppInfo[]>;
  private propContext: QueryContext<AndroidPropInfo>;

  constructor(private adb: AdbSerial) {
    this.shellTopInfoContext = {
      name: 'shell top info',
      querying: false,
      info: undefined,
      func: async (): Promise<AndroidShellTopInfo> => adb.getShellTopInfo(),
      default: DefaultAndroidShellTopInfo(),
    };
    this.focusedAppInfosContext = {
      name: 'focused app infos',
      querying: false,
      info: undefined,
      func: async (): Promise<FocusedAppInfo[]> => adb.getForegroundPackage(),
      default: [],
    };
    this.propContext = {
      name: 'prop',
      querying: false,
      info: undefined,
      func: async (): Promise<AndroidPropInfo> => adb.getProps(),
      default: DefaultAndroidPropInfo(),
    };
  }

  async queryShellTopInfo(): Promise<AndroidShellTopInfo> {
    return this.query(this.shellTopInfoContext);
  }

  async queryForegroundPackage(): Promise<FocusedAppInfo[]> {
    return this.query(this.focusedAppInfosContext);
  }

  async queryProp(): Promise<AndroidPropInfo> {
    return this.query(this.propContext);
  }

  private async query<T>(context: QueryContext<T>): Promise<T> {
    if (!context.querying) {
      context.querying = true;
      context.info = await context.func();
    }
    for await (const _ of loop(300, 10)) {
      if (context.info) {
        break;
      }
    }
    if (!context.info) {
      this.adb.printable.warn?.(`AndroidAdbProfileContext.query ${context.name} is not available for ${this.adb.serial}`);
      return context.default;
    }
    return context.info;
  }
}

export interface AndroidAdbProfilerParams {
  serial: Serial;
  adb: AdbSerial;
  context: AndroidAdbProfileContext;
  appium: AppiumContext;
  logger: FilledPrintable;
}

export interface AndroidAdbProfiler {
  profile(params: AndroidAdbProfilerParams): Promise<Partial<RuntimeInfo>>;
}

export class CpuProfiler implements AndroidAdbProfiler {
  async profile(params: AndroidAdbProfilerParams): Promise<Partial<RuntimeInfo>> {
    const { context } = params;
    const topInfo = await context.queryShellTopInfo();
    return {
      cpues: [
        {
          name: 'default',
          currentLoad: topInfo.header.user + topInfo.header.nice + topInfo.header.sys,
          currentLoadUser: topInfo.header.user,
          currentLoadSystem: topInfo.header.sys,
          currentLoadNice: topInfo.header.nice,
          currentLoadIdle: topInfo.header.idle,
          currentLoadIrq: topInfo.header.irq,
          currentLoadCpu: topInfo.header.cpu,
        },
      ],
    };
  }
}

export class MemProfiler implements AndroidAdbProfiler {
  async profile(params: AndroidAdbProfilerParams): Promise<Partial<RuntimeInfo>> {
    const { adb } = params;
    const procMeminfo = await adb.getProcMemInfo();
    return {
      mems: [
        {
          name: 'default',
          total: procMeminfo.MemTotal,
          free: procMeminfo.MemFree,
          used: procMeminfo.MemTotal - procMeminfo.MemFree,
          active: procMeminfo.Active,
          available: procMeminfo.MemAvailable,
          swaptotal: procMeminfo.SwapTotal,
          swapused: procMeminfo.SwapTotal - procMeminfo.SwapFree,
          swapfree: procMeminfo.SwapFree,
          isLow: false,
        },
      ],
    };
  }
}

export class FsProfiler implements AndroidAdbProfiler {
  async profile(params: AndroidAdbProfilerParams): Promise<Partial<RuntimeInfo>> {
    const { adb } = params;
    const dfInfos = (await adb.getDfInfo()).filter((x) => x.Mounted.startsWith('/data') || x.Mounted.startsWith('/storage'));
    const procDiskstats = await adb.getProcDiskstats();
    if (0 == procDiskstats.length) {
      return { fses: [] };
    }
    const fsInfos = dfInfos.map((df) => {
      const matchedDiskStat = procDiskstats.filter((ds) => df.Filesystem.toLowerCase().endsWith(ds.name.toLowerCase()));
      const hasMatch = 0 < matchedDiskStat.length;
      return {
        name: df.Mounted,
        type: '',
        size: df._1K_blocks,
        used: df.Used,
        available: df.Available,
        use: 0,
        mount: df.Mounted,
        readsCompleted: hasMatch ? (matchedDiskStat[0] !== undefined ? matchedDiskStat[0].readsCompletedSuccessfully : 0) : 0,
        writesCompleted: hasMatch ? (matchedDiskStat[0] !== undefined ? matchedDiskStat[0].writesCompleted : 0) : 0,
        timeSpentReadMs: hasMatch ? (matchedDiskStat[0] !== undefined ? matchedDiskStat[0].timeSpentReadingMs : 0) : 0,
        timeSpentWriteMs: hasMatch ? (matchedDiskStat[0] !== undefined ? matchedDiskStat[0].timeSpentWritingMs : 0) : 0,
      };
    });
    return { fses: fsInfos };
  }
}

export class ProcessProfiler implements AndroidAdbProfiler {
  async profile(params: AndroidAdbProfilerParams): Promise<Partial<RuntimeInfo>> {
    const { serial, context } = params;
    const topInfo = await context.queryShellTopInfo();
    const foregroundApps = (await context.queryForegroundPackage()).filter((x) => x.displayId === 0);
    const procs: AndroidShellTopProcInfo[] = [];

    foregroundApps.forEach((app) => {
      const foregroundProc = topInfo.procs.find((proc) => proc.ARGS.includes(app.packageName));
      if (foregroundProc) {
        procs.push(foregroundProc);
      }
    });

    if (0 === procs.length) {
      const slice = topInfo.procs.slice(0, 1);
      slice.forEach((proc) => {
        procs.push(proc);
      });
    }

    return {
      processes: procs.map((proc) => {
        const isForeground = foregroundApps.some((app) => proc.ARGS.includes(app.packageName));
        return {
          name: proc.ARGS,
          pid: proc.PID,
          isForeground: isForeground,
          cpues: [
            {
              name: 'default',
              percent: proc._CPU,
            },
          ],
          mems: [
            {
              name: 'default',
              percent: proc._MEM,
            },
          ],
          fses: [],
          nets: [],
        };
      }),
    };
  }
}

export class AndroidAdbProfileService implements ProfileService {
  private _profilers = new Map<ProfileMethodKind, AndroidAdbProfiler>([
    [ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_CPU_SHELLTOP, new CpuProfiler()],
    [ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_MEM_PROCMEMINFO, new MemProfiler()],
    // [ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_FS_PROCDISKSTATS, new FsProfiler()],
    [ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_PROCESS_SHELLTOP, new ProcessProfiler()],
    [ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_BLOCK_DEVELOPER_OPTIONS, new BlockDeveloperOptionsProfiler()],
  ]);

  constructor(
    private readonly appium: AppiumContext,
    private adb: AdbSerial,
  ) {}

  async profile(methods: ProfileMethod[]): Promise<Partial<RuntimeInfo>> {
    const { adb } = this;
    const logger = adb.printable;
    const serial = adb.serial;
    const profilers = methods
      .map((method) => {
        const { kind } = method;
        if (!kind) {
          logger.error('AndroidAdbProfileService.profile method kind is not specified');
          return undefined;
        }
        return kind;
      })
      .filter((kind) => kind !== undefined)
      .map((kind) => kind as ProfileMethodKind)
      .map((kind) => {
        const profiler = this._profilers.get(kind);
        if (!profiler) {
          return undefined;
        }
        return profiler;
      })
      .filter((profiler) => profiler !== undefined) as AndroidAdbProfiler[];
    const context = new AndroidAdbProfileContext(this.adb);
    const results = await Promise.allSettled(profilers.map((profiler) => profiler.profile({ serial, context, appium: this.appium, logger, adb })));
    const result = results.reduce((acc, cur) => {
      if (cur.status === 'fulfilled') {
        return { ...acc, ...cur.value };
      } else {
        logger.error(`AndroidAdbProfileService.profile failed`, { reason: cur.reason });
        return acc;
      }
    }, {});
    return result;
  }
}

export class AndroidDeviceAgentProfileService implements ProfileService {
  constructor(private readonly deviceAgentService: AndroidDeviceAgentService) {}

  async profile(methods: ProfileMethod[]): Promise<Partial<RuntimeInfo>> {
    const response = await this.deviceAgentService.sendWithProtobuf('dcDaQueryProfileParam', 'dcDaQueryProfileReturn', { profileMethods: methods }, 1000);
    return response?.info ?? {};
  }
}

export class AndroidDisplayProfileService implements ProfileService {
  constructor(
    private readonly deviceAgentService: AndroidDeviceAgentService,
    private adb: AdbSerial,
  ) {}

  async profile(methods: ProfileMethod[]): Promise<Partial<RuntimeInfo>> {
    const isIncludeType = methods.some((method) => method.kind === ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_DISPLAY);
    if (!isIncludeType) {
      return {};
    }
    return { displays: [{ name: 'default', isScreenOn: await this.adb.isScreenOn(), error: this.deviceAgentService.isAlive() ? undefined : 'agent not alive' }] };
  }
}
