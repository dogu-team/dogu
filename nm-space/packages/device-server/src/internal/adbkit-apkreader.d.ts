// import 'adbkit-apkreader';
declare module 'adbkit-apkreader' {
  export interface Manifest {
    versionCode?: number;
    versionName?: string;
    package?: string;
    usesPermissions?: [];
    permissions?: [];
    permissionTrees?: [];
    permissionGroups?: [];
    instrumentation?: null;
    usesSdk?: { minSdkVersion?: number; targetSdkVersion?: number };
    usesConfiguration?: null;
    usesFeatures?: [];
    supportsScreens?: null;
    compatibleScreens?: [];
    supportsGlTextures?: [];
    application?: {
      theme?: string;
      label?: string;
      icon?: string;
      debuggable?: boolean;
      allowBackup?: boolean;
      activities?: {
        label?: string;
        name?: string;
        intentFilters?: { actions: [{ name: string }]; categories: [{ name: string }]; data: [] }[];
        metaData?: [];
      }[];
      activityAliases?: [];
      launcherActivities?: {
        label?: string;
        name?: string;
        intentFilters?: { actions: [{ name: string }]; categories: [{ name: string }]; data: [] }[];
        metaData?: [];
      }[];
      services?: [];
      receivers?: [];
      providers?: [];
      usesLibraries?: [];
    };
  }
  export interface ApkReader {
    public readManifest(): Promise<Manifest>;
  }
  export function open(path: string): Promise<ApkReader>;
}
