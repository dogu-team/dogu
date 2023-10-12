import { ProfileMethod, ProfileMethodKind, RuntimeInfo, Serial } from '@dogu-private/types';
import { FilledPrintable } from '@dogu-tech/common';
import systeminformation from 'systeminformation';
import { ProfileService } from './profile-service';

interface DesktopProfiler {
  profile(serial: Serial): Promise<Partial<RuntimeInfo>>;
}

export class CpuProfiler implements DesktopProfiler {
  async profile(serial: Serial): Promise<Partial<RuntimeInfo>> {
    const currentLoad = await systeminformation.currentLoad();
    return {
      cpues: [
        {
          ...currentLoad,
          name: 'default',
          currentLoadCpu: 100,
        },
      ],
    };
  }
}

export class MemProfiler implements DesktopProfiler {
  async profile(serial: Serial): Promise<Partial<RuntimeInfo>> {
    const mem = await systeminformation.mem();
    return {
      mems: [
        {
          ...mem,
          name: 'default',
          isLow: false,
        },
      ],
    };
  }
}
export class FsProfiler implements DesktopProfiler {
  async profile(serial: Serial): Promise<Partial<RuntimeInfo>> {
    const fsSizes = await systeminformation.fsSize();
    const fsInfos = fsSizes.map((fs) => {
      return {
        name: fs.fs,
        type: '',
        size: fs.size,
        used: fs.used,
        available: fs.available,
        use: fs.use,
        mount: fs.mount,
        readsCompleted: 0,
        writesCompleted: 0,
        timeSpentReadMs: 0,
        timeSpentWriteMs: 0,
      };
    });
    if (0 < fsInfos.length) {
      const fsStat = await systeminformation.fsStats();
      if (fsStat) {
        const fsInfo = fsInfos[0];
        if (fsInfo === undefined) {
          throw new Error('fsInfo is undefined');
        }
        fsInfo.readsCompleted = fsStat.rx;
        fsInfo.writesCompleted = fsStat.wx;
        fsInfo.timeSpentReadMs = fsStat.rx_sec ?? 0 * 1000;
        fsInfo.timeSpentWriteMs = fsStat.wx_sec ?? 0 * 1000;
      }
    }
    return { fses: fsInfos };
  }
}

export class DisplayProfiler implements DesktopProfiler {
  async profile(serial: Serial): Promise<Partial<RuntimeInfo>> {
    return Promise.resolve({ displays: [{ name: 'default', isScreenOn: true }] });
  }
}

export class DesktopProfileService implements ProfileService {
  private _profilers = new Map<ProfileMethodKind, DesktopProfiler>([
    [ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_CPU, new CpuProfiler()],
    [ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_MEM, new MemProfiler()],
    [ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_FS, new FsProfiler()],
    [ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_DISPLAY, new DisplayProfiler()],
  ]);

  async profile(serial: Serial, methods: ProfileMethod[], logger: FilledPrintable): Promise<RuntimeInfo> {
    const profilers = methods
      .map((method) => {
        const { kind } = method;
        if (!kind) {
          logger.warn('DesktopProfileService.profile method kind is not specified');
          return undefined;
        }
        return kind;
      })
      .filter((kind) => kind !== undefined)
      .map((kind) => kind as ProfileMethodKind)
      .map((kind) => {
        const profiler = this._profilers.get(kind);
        if (!profiler) {
          // logger.verbose(`DesktopProfileService.profile method kind ${kind} is not supported`);
          return undefined;
        }
        return profiler;
      })
      .filter((profiler) => profiler !== undefined) as DesktopProfiler[];
    const results = await Promise.allSettled(profilers.map((profiler) => profiler.profile(serial)));
    const result = results.reduce((acc, res) => {
      if (res.status === 'fulfilled') {
        return { ...acc, ...res.value };
      } else {
        logger.warn('DesktopProfileService.profile failed.', { reason: res.reason });
        return acc;
      }
    }, RuntimeInfo.fromPartial({}));
    return result;
  }
}
