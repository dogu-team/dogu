import { IsObject } from 'class-validator';

export type AppiumCapabilities = Record<string, unknown>;

export class GetAppiumCapabilitiesResponse {
  @IsObject()
  capabilities!: AppiumCapabilities;
}
