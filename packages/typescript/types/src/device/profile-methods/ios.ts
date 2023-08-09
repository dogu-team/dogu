import { ProfileMethod, ProfileMethodKind } from '../../protocol/generated/tsproto/outer/profile/profile_method';

export const CpuLoadInfo: ProfileMethod = {
  kind: ProfileMethodKind.PROFILE_METHOD_KIND_IOS_CPU_LOAD_INFO,
  name: 'cpu load info',
};

export const MemVmStatistics: ProfileMethod = {
  kind: ProfileMethodKind.PROFILE_METHOD_KIND_IOS_MEM_VM_STATISTICS,
  name: 'vm statistics',
};
