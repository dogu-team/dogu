import { ProfileMethod, ProfileMethodKind, RuntimeInfo, Serial } from '@dogu-private/types';
import { DuplicatedCallGuarder, FilledPrintable, loop, stringify } from '@dogu-tech/common';
import { killChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import { AppiumContext } from '../../../appium/appium.context';
import { FocusedAppInfo } from '../../externals/cli/adb/adb';
import { Adb, AndroidShellTopInfo, AndroidShellTopProcInfo, DefaultAndroidShellTopInfo } from '../../externals/index';
import { AndroidDeviceAgentService } from '../device-agent/android-device-agent-service';
import { ProfileService } from './profile-service';

interface QueryContext<T> {
  name: string;
  querying: boolean;
  info: T | undefined;
  func: () => Promise<T>;
  default: T;
}

class AndroidAdbProfileContext {
  private shellTopInfoContext: QueryContext<AndroidShellTopInfo>;
  private focusedAppInfosContext: QueryContext<FocusedAppInfo[]>;

  constructor(private readonly serial: Serial, private readonly logger: FilledPrintable) {
    this.shellTopInfoContext = {
      name: 'shell top info',
      querying: false,
      info: undefined,
      func: async (): Promise<AndroidShellTopInfo> => Adb.getShellTopInfo(serial),
      default: DefaultAndroidShellTopInfo(),
    };
    this.focusedAppInfosContext = {
      name: 'focused app infos',
      querying: false,
      info: undefined,
      func: async (): Promise<FocusedAppInfo[]> => Adb.getForegroundPackage(serial),
      default: [],
    };
  }

  async queryShellTopInfo(): Promise<AndroidShellTopInfo> {
    return this.query(this.shellTopInfoContext);
  }

  async queryForegroundPackage(): Promise<FocusedAppInfo[]> {
    return this.query(this.focusedAppInfosContext);
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
      this.logger.warn(`AndroidAdbProfileContext.query ${context.name} is not available for ${this.serial}`);
      return context.default;
    }
    return context.info;
  }
}

interface AndroidAdbProfilerParams {
  serial: Serial;
  context: AndroidAdbProfileContext;
  appium: AppiumContext;
  logger: FilledPrintable;
}

interface AndroidAdbProfiler {
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
    const { serial, context } = params;
    const procMeminfo = await Adb.getProcMemInfo(serial);
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
    const { serial, context } = params;
    const dfInfos = (await Adb.getDfInfo(serial)).filter((x) => x.Mounted.startsWith('/data') || x.Mounted.startsWith('/storage'));
    const procDiskstats = await Adb.getProcDiskstats(serial);
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

const DeveloperEnabledLogKeyword = 'onDeveloperOptionsEnabled';

export class BlockDeveloperOptionsProfiler implements AndroidAdbProfiler {
  private readonly onUpdateGuarder = new DuplicatedCallGuarder();
  private logcatProc: child_process.ChildProcess | undefined = undefined;
  async profile(params: AndroidAdbProfilerParams): Promise<Partial<RuntimeInfo>> {
    const { serial, context, appium, logger } = params;
    const settingsAppInfo = this.getSettingsInfoIfFocused(await context.queryForegroundPackage());
    if (!settingsAppInfo) {
      this.killLogcatProcess();
      return {};
    }
    if (!this.logcatProc) {
      await this.startLogcatProcess(serial, settingsAppInfo.packageName, logger);
    }
    this.onUpdateGuarder
      .guard(async () => {
        await this.catchAndKill(serial, settingsAppInfo.packageName, appium);
      })
      .catch((e) => {
        logger.warn(`BlockDeveloperOptionsProfiler.profile failed`, { reason: e });
      });

    return {};
  }

  private async catchAndKill(serial: Serial, packageName: string, appium: AppiumContext): Promise<void> {
    for await (const _ of loop(300, 10)) {
      const settingsAppInfo = this.getSettingsInfoIfFocused(await Adb.getForegroundPackage(serial));
      if (!settingsAppInfo) {
        break;
      }
      const text = 'Developer options';
      const devOptionsTitle = await appium.select(`android=new UiSelector().resourceId("com.android.settings:id/action_bar").childSelector(new UiSelector().text("${text}"))`);
      if (!devOptionsTitle) {
        return;
      }
      if (devOptionsTitle.error) {
        return;
      }

      await Adb.killPackage(serial, packageName);
    }
  }

  private getSettingsInfoIfFocused(focusedAppInfos: FocusedAppInfo[]): FocusedAppInfo | undefined {
    const filtered = focusedAppInfos.filter((app) => app.displayId === 0 && app.packageName.startsWith('com.android.settings'));
    if (0 === filtered.length) {
      return undefined;
    }
    return filtered[0];
  }

  private async startLogcatProcess(serial: Serial, packageName: string, logger: FilledPrintable): Promise<void> {
    const openTime = await Adb.getTime(serial);
    if (openTime) {
      const killPackageIfContains = (msg: string): void => {
        if (msg.includes(DeveloperEnabledLogKeyword)) {
          Adb.killPackage(serial, packageName).catch((e) => {
            logger.error(e);
          });
          this.killLogcatProcess();
        }
      };
      this.logcatProc = Adb.logcat(
        serial,
        ['-e', DeveloperEnabledLogKeyword, '-T', `${openTime}`],
        {
          info: (msg) => killPackageIfContains(stringify(msg)),
          error: (msg) => killPackageIfContains(stringify(msg)),
        },
        logger,
      );
    }
  }

  private killLogcatProcess(): void {
    if (this.logcatProc) {
      killChildProcess(this.logcatProc).catch((e) => {
        console.error(e);
      });
      this.logcatProc = undefined;
    }
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

  constructor(private readonly appium: AppiumContext) {}

  async profile(serial: Serial, methods: ProfileMethod[], logger: FilledPrintable): Promise<Partial<RuntimeInfo>> {
    const profilers = methods
      .map((method) => {
        const { kind } = method;
        if (!kind) {
          logger.warn('AndroidAdbProfileService.profile method kind is not specified');
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
    const context = new AndroidAdbProfileContext(serial, logger);
    const results = await Promise.allSettled(profilers.map((profiler) => profiler.profile({ serial, context, appium: this.appium, logger })));
    const result = results.reduce((acc, cur) => {
      if (cur.status === 'fulfilled') {
        return { ...acc, ...cur.value };
      } else {
        logger.warn(`AndroidAdbProfileService.profile failed`, { reason: cur.reason });
        return acc;
      }
    }, {});
    return result;
  }
}

export class AndroidDeviceAgentProfileService implements ProfileService {
  constructor(private readonly deviceAgentService: AndroidDeviceAgentService) {}

  async profile(serial: Serial, methods: ProfileMethod[]): Promise<Partial<RuntimeInfo>> {
    const response = await this.deviceAgentService.sendWithProtobuf('dcDaQueryProfileParam', 'dcDaQueryProfileReturn', { profileMethods: methods }, 1000);
    return response?.info ?? {};
  }
}

export class AndroidDisplayProfileService implements ProfileService {
  constructor(private readonly deviceAgentService: AndroidDeviceAgentService) {}

  async profile(serial: Serial, methods: ProfileMethod[]): Promise<Partial<RuntimeInfo>> {
    const isIncludeType = methods.some((method) => method.kind === ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_DISPLAY);
    if (!isIncludeType) {
      return {};
    }
    return { displays: [{ name: 'default', isScreenOn: await Adb.isScreenOn(serial), error: this.deviceAgentService.isAlive() ? undefined : 'agent not alive' }] };
  }
}
