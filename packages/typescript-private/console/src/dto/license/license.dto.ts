import { OrganizationId } from '@dogu-private/types';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCloudLicenseDto {
  @IsUUID()
  organizationId!: OrganizationId;
}

export class CreateSelfHostedLicenseDto {
  @IsUUID()
  organizationId!: OrganizationId;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  expiredAt!: Date;
}

export class RegisterSelfHostedLicenseDto {
  @IsNotEmpty()
  @IsString()
  licenseKey!: string;
}

export interface LicenseErrorInfo {
  isTokenInValid: boolean;
  isLicenseServerDisConnected: boolean;
  unKnownError: boolean;
}
