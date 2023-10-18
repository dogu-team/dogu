export interface AndroidProcCpuInfo {
  processor: number;
  Features: string;
  CPU_architecture: number;
  CPU_implementer: number;
  CPU_variant: number;
  CPU_part: number;
  CPU_revision: number;
}

export function DefaultAndroidProcCpuInfo(): AndroidProcCpuInfo {
  return {
    processor: 0,
    Features: '',
    CPU_architecture: 0,
    CPU_implementer: 0,
    CPU_variant: 0,
    CPU_part: 0,
    CPU_revision: 0,
  };
}

export interface AndroidProcMemInfo {
  MemTotal: number;
  MemFree: number;
  MemAvailable: number;
  Buffers: number;
  Cached: number;
  SwapCached: number;
  Active: number;
  Inactive: number;
  Unevictable: number;
  Mlocked: number;
  SwapTotal: number;
  SwapFree: number;
  Dirty: number;
  Writeback: number;
  AnonPages: number;
  Mapped: number;
  Shmem: number;
  Slab: number;
  SReclaimable: number;
  SUnreclaim: number;
  KernelStack: number;
  PageTables: number;
  NFS_Unstable: number;
  Bounce: number;
  WritebackTmp: number;
  CommitLimit: number;
  Committed_AS: number;
  VmallocTotal: number;
  VmallocUsed: number;
  VmallocChunk: number;
}

export function DefaultAndroidProcMemInfo(): AndroidProcMemInfo {
  return {
    MemTotal: 0,
    MemFree: 0,
    MemAvailable: 0,
    Buffers: 0,
    Cached: 0,
    SwapCached: 0,
    Active: 0,
    Inactive: 0,
    Unevictable: 0,
    Mlocked: 0,
    SwapTotal: 0,
    SwapFree: 0,
    Dirty: 0,
    Writeback: 0,
    AnonPages: 0,
    Mapped: 0,
    Shmem: 0,
    Slab: 0,
    SReclaimable: 0,
    SUnreclaim: 0,
    KernelStack: 0,
    PageTables: 0,
    NFS_Unstable: 0,
    Bounce: 0,
    WritebackTmp: 0,
    CommitLimit: 0,
    Committed_AS: 0,
    VmallocTotal: 0,
    VmallocUsed: 0,
    VmallocChunk: 0,
  };
}

//https://precommer.tistory.com/13
export interface AndroidProcDiskstats {
  major: number;
  minor: number;
  name: string;
  readsCompletedSuccessfully: number;
  readsMerged: number;
  sectorsRead: number;
  timeSpentReadingMs: number;
  writesCompleted: number;
  wirtesMerged: number;
  sectorsWritten: number;
  timeSpentWritingMs: number;
  ioCurrentlyInProgress: number;
  timeSpentDoingioMs: number;
  weightedTimeSpentDoingioMs: number;
}

export function DefaultAndroidProcDiskstats(): AndroidProcDiskstats {
  return {
    major: 0,
    minor: 0,
    name: '',
    readsCompletedSuccessfully: 0,
    readsMerged: 0,
    sectorsRead: 0,
    timeSpentReadingMs: 0,
    writesCompleted: 0,
    wirtesMerged: 0,
    sectorsWritten: 0,
    timeSpentWritingMs: 0,
    ioCurrentlyInProgress: 0,
    timeSpentDoingioMs: 0,
    weightedTimeSpentDoingioMs: 0,
  };
}

export interface AndroidDfInfo {
  Filesystem: string;
  _1K_blocks: number;
  Used: number;
  Available: number;
  Mounted: string;
}

export function DefaultAndroidDfInfo(): AndroidDfInfo {
  return {
    Filesystem: '',
    _1K_blocks: 0,
    Used: 0,
    Available: 0,
    Mounted: '',
  };
}

export interface AndroidShellTopHeaderInfo {
  Taskstotal: number;
  Tasksrunning: number;
  Taskssleeping: number;
  Tasksstopped: number;
  Taskszombie: number;
  Memtotal: number;
  Memused: number;
  Memfree: number;
  Membuffers: number;
  Swaptotal: number;
  Swapused: number;
  Swapfree: number;
  Swapcached: number;
  cpu: number;
  user: number;
  nice: number;
  sys: number;
  idle: number;
  iow: number;
  irq: number;
  sirq: number;
  host: number;
}

export interface AndroidShellTopProcInfo {
  PID: number;
  USER: string;
  PR: number;
  NI: number;
  VIRT: number;
  RES: number;
  SHR: number;
  S: string;
  _CPU: number;
  _MEM: number;
  TIME_: string;
  ARGS: string;
}

export function DefaultAndroidShellTopProcInfo(): AndroidShellTopProcInfo {
  return {
    PID: 0,
    USER: '',
    PR: 0,
    NI: 0,
    VIRT: 0,
    RES: 0,
    SHR: 0,
    S: '',
    _CPU: 0,
    _MEM: 0,
    TIME_: '',
    ARGS: '',
  };
}

export interface AndroidShellTopInfo {
  header: AndroidShellTopHeaderInfo;
  procs: AndroidShellTopProcInfo[];
}

export function DefaultAndroidShellTopInfo(): AndroidShellTopInfo {
  return {
    header: {
      Taskstotal: 0,
      Tasksrunning: 0,
      Taskssleeping: 0,
      Tasksstopped: 0,
      Taskszombie: 0,
      Memtotal: 0,
      Memused: 0,
      Memfree: 0,
      Membuffers: 0,
      Swaptotal: 0,
      Swapused: 0,
      Swapfree: 0,
      Swapcached: 0,
      cpu: 0,
      user: 0,
      nice: 0,
      sys: 0,
      idle: 0,
      iow: 0,
      irq: 0,
      sirq: 0,
      host: 0,
    },
    procs: [],
  };
}

export interface AndroidPropInfo {
  ro_build_version_release: string; // version
  ro_product_manufacturer: string; // system manufacturer
  ro_product_model: string; // system model
  ro_serialno: string; // system serial
  ro_system_build_date: string; // bios releaseDate
  ro_product_brand: string; // baseboard manufacturer
  ro_product_cpu_abi: string; // os arch
  ro_product_name: string; // os hostname
  ro_product_locale: string; // locale
  ro_build_characteristics: 'emulator' | 'phone' | string; // emulator or phone
  persist_sys_locale: string; // language-locale
  persist_sys_test_harness: string; // is test harness enabled
  debug_hwui_profile: string; // Profile GPU Rendering (https://stackoverflow.com/questions/42492191/how-to-show-hide-profile-gpu-rendering-as-bars-using-adb-command)
}

export function DefaultAndroidPropInfo(): AndroidPropInfo {
  return {
    ro_build_version_release: '',
    ro_product_manufacturer: '',
    ro_product_model: '',
    ro_serialno: '',
    ro_system_build_date: '',
    ro_product_brand: '',
    ro_product_cpu_abi: '',
    ro_product_name: '',
    ro_product_locale: '',
    ro_build_characteristics: 'phone',
    persist_sys_locale: '',
    persist_sys_test_harness: '',
    debug_hwui_profile: '',
  };
}
