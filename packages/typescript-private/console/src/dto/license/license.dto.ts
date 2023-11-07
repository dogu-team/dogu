import { OrganizationId } from '@dogu-private/types';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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
