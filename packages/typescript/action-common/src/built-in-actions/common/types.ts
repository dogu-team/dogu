import { PlatformType } from '@dogu-tech/types';

export type AppVersion = number | string | Record<PlatformType, string>;

export type AppPackageName = string | Record<PlatformType, string>;
