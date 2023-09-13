import { OrganizationId } from '@dogu-private/types';
import { Type } from 'class-transformer';
import { Equals, IsEnum, IsIn, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
import { LicenseType, LicenseTypeKey } from '../../base/license';
import { LICENSE_TIER_TYPE } from '../../base/license-tier';

export class LicenseDtoBase {
  @IsIn([LicenseTypeKey])
  licenseType!: LicenseType;

  @IsEnum(LICENSE_TIER_TYPE)
  tierType!: LICENSE_TIER_TYPE;

  @IsNumber()
  @Type(() => Number)
  durationDate?: number | null;
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
