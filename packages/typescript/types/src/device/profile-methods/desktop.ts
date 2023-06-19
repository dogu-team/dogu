import { ProfileMethod, ProfileMethodKind } from '../../protocol/generated/tsproto/outer/profile/profile_method';

export const Cpu: ProfileMethod = {
  kind: ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_CPU,
  name: 'cpu',
};

export const CpuFreq: ProfileMethod = {
  kind: ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_CPUFREQ,
  name: 'cpufreq',
};

export const Mem: ProfileMethod = {
  kind: ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_MEM,
  name: 'mem',
};

export const Fs: ProfileMethod = {
  kind: ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_FS,
  name: 'fs',
};

export const Net: ProfileMethod = {
  kind: ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_NET,
  name: 'net',
};
