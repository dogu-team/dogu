import { ProfileMethod, ProfileMethodKind } from '../../protocol/generated/tsproto/outer/profile/profile_method';

export const CpuShellTop: ProfileMethod = {
  kind: ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_CPU_SHELLTOP,
  name: 'shell top',
};

export const CpuFreqCat: ProfileMethod = {
  kind: ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_CPUFREQ_CAT,
  name: 'cat cpufreq',
};

export const MemActivityManager: ProfileMethod = {
  kind: ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_MEM_ACTIVITYMANAGER,
  name: 'ActivityManager',
};

export const MemProcMemInfo: ProfileMethod = {
  kind: ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_MEM_PROCMEMINFO,
  name: 'cat /proc/meminfo',
};

export const FsProcDiskStats: ProfileMethod = {
  kind: ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_FS_PROCDISKSTATS,
  name: 'cat /proc/diskstats',
};

export const NetTrafficStats: ProfileMethod = {
  kind: ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_NET_TRAFFICSTATS,
  name: 'TrafficStats',
};

export const ProcessShellTop: ProfileMethod = {
  kind: ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_PROCESS_SHELLTOP,
  name: 'process shell top',
};
