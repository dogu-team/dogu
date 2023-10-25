import { OrganizationId } from '@dogu-private/types';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { SelfHostedLicenseBase } from '../..';

export class CreateCloudLicenseDto {
  @IsUUID()
  organizationId!: OrganizationId;
}

export class CreateSelfHostedLicenseDto {
  @IsOptional()
  @IsUUID()
  organizationId?: OrganizationId;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  expiredAt!: Date;
}

export interface LicenseErrorInfo {
  isTokenInValid: boolean;
  isLicenseServerDisConnected: boolean;
  unKnownError: boolean;
}
export interface SelfHostedLicenseResponse extends SelfHostedLicenseBase {
  errorInfo: LicenseErrorInfo | null;
  isCommunityEdition: boolean;
  consoleRegisteredToken: string | null;
}
