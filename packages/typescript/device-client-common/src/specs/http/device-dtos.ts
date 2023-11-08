import { IsFilledString } from '@dogu-tech/common';
import { DeviceSystemInfo, ErrorDevice, GeoLocationDto, LocalDeviceDetectToken, LocaleCodeDto, Platform, PlatformSerial, Serial } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class GetDeviceSerialsResponse {
  @IsArray()
  serials!: Serial[];
}

export class GetDevicePlatformSerialsResponse {
  @IsArray()
  platformSerials!: PlatformSerial[];
}

export class GetDevicesWithErrorResponse {
  @IsArray()
  errorDevices!: ErrorDevice[];
}

export class GetDeviceSystemInfoResponse implements DeviceSystemInfo {
  nickname!: string;
  marketName!: string;
  version!: string;
  timeMs!: number;
  isVirtual!: boolean;
  system!: { manufacturer: string; model: string; version: string; serial: string; uuid: string; sku: string };
  bios!: { vendor: string; version: string; releaseDate: string; revision: string; serial?: string | undefined; language?: string | undefined; features?: string[] | undefined };
  baseboard!: { manufacturer: string; model: string; version: string; serial: string; assetTag: string; memMax: number | null; memSlots: number | null };
  chassis!: { manufacturer: string; model: string; type: string; version: string; serial: string; assetTag: string; sku: string };
  os!: { platform: Platform; arch: string; hostname: string; release: string };
  uuid!: { os: string; hardware: string };
  cpu!: { manufacturer: string; brand: string; speed: number; cores: number; physicalCores: number };
  graphics!: {
    controllers: {
      vendor: string;
      vendorId?: string | undefined;
      model: string;
      deviceId?: string | undefined;
      cores?: number | undefined;
      name?: string | undefined;
      pciBus?: string | undefined;
      pciID?: string | undefined;
      fanSpeed?: number | undefined;
      memoryTotal?: number | undefined;
    }[];
    displays: { vendor: string; vendorId: string; model: string; deviceName: string; displayId: string; resolutionX: number; resolutionY: number }[];
  };
  net!: {
    iface: string;
    ifaceName: string;
    ip4: string;
    ip4subnet: string;
    ip6: string;
    ip6subnet: string;
    mac: string;
    type: string;
    duplex: string;
    mtu: number;
    speed: number;
    dhcp: boolean;
  }[];
  memLayout!: { [key: string]: unknown; size: number }[];
  diskLayout!: { [key: string]: unknown; name: string; size: number }[];
}

export class CreateLocalDeviceDetectTokenRequest {
  @IsString()
  token!: LocalDeviceDetectToken;

  @IsNumber()
  lifeTimeSeconds!: number;
}

export class GetLocalDeviceDetectResponse {
  @IsArray()
  @IsString({ each: true })
  tokens!: LocalDeviceDetectToken[];
}

export class GetPageSourceResponse {
  @IsString()
  pageSource!: string;
}

export class GetContextsResponse {
  @IsArray()
  @IsString({ each: true })
  contexts!: string[];
}

export class GetContextResponse {
  @IsString()
  context!: string;
}

export class SwitchContextRequest {
  @IsString()
  context!: string;
}

export class SwitchContextAndGetPageSourceRequest {
  @IsString()
  context!: string;
}

export class SwitchContextAndGetPageSourceResponse {
  @IsString()
  pageSource!: string;
}

export class ScreenSize {
  @IsNumber()
  @Type(() => Number)
  width!: number;

  @IsNumber()
  @Type(() => Number)
  height!: number;
}

export class Rect {
  @IsNumber()
  @Type(() => Number)
  x!: number;

  @IsNumber()
  @Type(() => Number)
  y!: number;

  @IsNumber()
  @Type(() => Number)
  width!: number;

  @IsNumber()
  @Type(() => Number)
  height!: number;
}

export class SystemBar extends Rect {
  @IsBoolean()
  visible!: boolean;
}

export class Android {
  // @ValidateNested()
  // @Type(() => Rect)
  // viewport!: Rect;

  @ValidateNested()
  @Type(() => SystemBar)
  statusBar!: SystemBar;

  @ValidateNested()
  @Type(() => SystemBar)
  navigationBar!: SystemBar;
}

export class ContextPageSource {
  @IsFilledString()
  context!: string;

  @IsFilledString()
  pageSource!: string;

  @ValidateNested()
  @Type(() => ScreenSize)
  @IsOptional()
  screenSize!: ScreenSize;

  @ValidateNested()
  @Type(() => Android)
  @IsOptional()
  android?: Android;
}

export class GetContextPageSourcesResponse {
  @ValidateNested({ each: true })
  @Type(() => ContextPageSource)
  @IsArray()
  contextPageSources!: ContextPageSource[];
}

export class TryConnectGamiumInspectorRequest {
  @IsNumber()
  @Type(() => Number)
  gamiumEnginePort = 50061;
}

export const TryConnectGamiumInspectorStatus = ['connected', 'notConnected'] as const;
export type TryConnectGamiumInspectorStatus = (typeof TryConnectGamiumInspectorStatus)[number];

export class TryConnectGamiumInspectorResponse {
  @IsIn(TryConnectGamiumInspectorStatus)
  status!: TryConnectGamiumInspectorStatus;
}

export class GetHitPointQuery {
  @IsNumber()
  @Type(() => Number)
  x!: number;

  @IsNumber()
  @Type(() => Number)
  y!: number;

  @IsNumber()
  @Type(() => Number)
  deviceWidth!: number;

  @IsNumber()
  @Type(() => Number)
  deviceHeight!: number;
}

export class HitPoint {
  @IsNumber()
  @Type(() => Number)
  x!: number;

  @IsNumber()
  @Type(() => Number)
  y!: number;

  @IsNumber()
  @Type(() => Number)
  z!: number;
}

export class GetHitPointResponse {
  @ValidateNested()
  @Type(() => HitPoint)
  hitPoint: HitPoint | undefined;
}

export interface AppiumContextInfo {
  serial: Serial;
  platform: Platform;
  client: {
    remoteOptions: Record<string, unknown>;
    capabilities: Record<string, unknown>;
    sessionId: string;
  };
  server: {
    port: number;
    workingPath: string;
    command: string;
    env: Record<string, string | undefined>;
  };
}

export class GetAppiumContextInfoResponse {
  @IsObject()
  info!: AppiumContextInfo;
}

export type AppiumCapabilities = Record<string, unknown>;

export class GetAppiumCapabilitiesResponse {
  @IsObject()
  capabilities!: AppiumCapabilities;
}

export class GetSystemBarVisibility {
  @IsBoolean()
  statusBar!: boolean;

  @IsBoolean()
  navigationBar!: boolean;
}

export class GetDeviceLocaleResponse {
  @ValidateNested()
  @Type(() => LocaleCodeDto)
  localeCode!: LocaleCodeDto;
}

export class GetDeviceGeoLocationResponse {
  @ValidateNested()
  @Type(() => GeoLocationDto)
  location!: GeoLocationDto;
}

export class GetDeviceScreenshotResponse {
  @IsFilledString()
  base64!: string;
}
