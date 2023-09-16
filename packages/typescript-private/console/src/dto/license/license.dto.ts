import { OrganizationId } from '@dogu-private/types';
import { Type } from 'class-transformer';
import { Equals, IsIn, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
import { LicenseBase, LicenseType, LicenseTypeKey } from '../../base/license';

export class LicenseDtoBase {
  @IsIn([LicenseTypeKey])
  licenseType!: LicenseType;

  @IsNumber()
  @Type(() => Number)
  durationDate?: number | null;

  @IsString()
  licenseTierName!: string;
}

export class CreateLicenseWithCloudDto extends LicenseDtoBase {
  @Equals('cloud')
  declare licenseType: 'cloud';

  @IsUUID()
  organizationId!: OrganizationId;
}

export class CreateLicenseWithSelfHostedDto extends LicenseDtoBase {
  @Equals('self-hosted')
  declare licenseType: 'self-hosted';

  @IsString()
  companyName!: string;

  @IsNumber()
  @Type(() => Number)
  enabledMobileCount!: number;

  @IsNumber()
  @Type(() => Number)
  enabledBrowserCount!: number;
}

export class CreateLicenseDto {
  @ValidateNested()
  @Type(() => LicenseDtoBase, {
    discriminator: {
      property: 'licenseType',
      subTypes: [
        { value: CreateLicenseWithCloudDto, name: 'cloud' },
        { value: CreateLicenseWithSelfHostedDto, name: 'self-hosted' },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  licenseInfo!: CreateLicenseWithCloudDto | CreateLicenseWithSelfHostedDto;
}

export class FindLicenseDtoBase {
  @IsString()
  licenseToken!: string;
}

export class FindLicenseWithCloudDto extends FindLicenseDtoBase {
  @IsUUID()
  organizationId!: OrganizationId;
}

export class FindLicenseWithSelfHostedDto extends FindLicenseDtoBase {
  @IsString()
  companyName!: string;
}

export interface LicenseErrorInfo {
  isTokenInValid: boolean;
  isLicenseServerDisConnected: boolean;
  unKnownError: boolean;
}
export interface LicenseResponse extends LicenseBase {
  errorInfo: LicenseErrorInfo | null;
  isCommunityEdition: boolean;
}
