import { fillOptionsSync, IsFilledString, LogLevel } from '@dogu-tech/common';
import { FromProcessEnv } from '@dogu-tech/node';
import { DeviceId, OrganizationId, PlatformType, StepContextEnv } from '@dogu-tech/types';
import { IsIn, IsNumber, IsUUID } from 'class-validator';

type GameProfileReporterEnvDependencies = Pick<
  StepContextEnv,
  | 'DOGU_DEVICE_PLATFORM' //
  | 'DOGU_ORGANIZATION_ID'
  | 'DOGU_DEVICE_ID'
  | 'DOGU_API_BASE_URL'
  | 'DOGU_HOST_TOKEN'
  | 'DOGU_LOG_LEVEL'
>;

type GameProfileReporterEnv = GameProfileReporterEnvDependencies & {
  DOGU_GAME_PROFILE_REQUEST_INTERVAL: string;
};

export class GameProfileReporterOptions {
  /**
   * @default unspecified
   * @requires process.env.DOGU_DEVICE_PLATFORM
   * @description Device platform. Available values are `unspecified`, `android`, `ios`, `macos`, `windows`.
   */
  @IsIn(PlatformType)
  @FromProcessEnv<GameProfileReporterEnv>('DOGU_DEVICE_PLATFORM')
  devicePlatform?: PlatformType;

  /**
   * @default ''
   * @requires process.env.DOGU_ORGANIZATION_ID
   * @description Dogu platform organization id.
   */
  @IsUUID()
  @FromProcessEnv<GameProfileReporterEnv>('DOGU_ORGANIZATION_ID')
  organizationId?: OrganizationId;

  /**
   * @default ''
   * @requires process.env.DOGU_DEVICE_ID
   * @description Dogu platform device id.
   */
  @IsUUID()
  @FromProcessEnv<GameProfileReporterEnv>('DOGU_DEVICE_ID')
  deviceId?: DeviceId;

  /**
   * @default ''
   * @requires process.env.DOGU_API_BASE_URL
   * @description Dogu platform api base url.
   */
  @IsFilledString()
  @FromProcessEnv<GameProfileReporterEnv>('DOGU_API_BASE_URL')
  apiBaseUrl?: string;

  /**
   * @default ''
   * @requires process.env.DOGU_HOST_TOKEN
   * @description Dogu platform host token.
   */
  @IsFilledString()
  @FromProcessEnv<GameProfileReporterEnv>('DOGU_HOST_TOKEN')
  hostToken?: string;

  /**
   * @default info
   * @requires process.env.DOGU_LOG_LEVEL
   * @description Log level.
   */
  @IsIn(LogLevel)
  @FromProcessEnv<GameProfileReporterEnv>('DOGU_LOG_LEVEL')
  logLevel?: LogLevel;

  /**
   * @default 3000
   * @requires process.env.DOGU_GAME_PROFILE_REQUEST_INTERVAL
   * @description Game profile reporting period.
   */
  @IsNumber()
  @FromProcessEnv<GameProfileReporterEnv>('DOGU_GAME_PROFILE_REQUEST_INTERVAL', {
    transform: Number,
  })
  requestInterval?: number;
}

export function fillGameProfileReporterOptions(options?: GameProfileReporterOptions): Required<GameProfileReporterOptions> {
  return fillOptionsSync(
    GameProfileReporterOptions,
    {
      devicePlatform: 'unspecified',
      organizationId: '',
      deviceId: '',
      apiBaseUrl: '',
      hostToken: '',
      logLevel: 'info',
      requestInterval: 3000,
    },
    options,
  );
}
