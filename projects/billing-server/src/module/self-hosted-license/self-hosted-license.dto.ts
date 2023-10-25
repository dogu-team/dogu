import { OrganizationId } from '@dogu-private/types';
import { IsNotEmpty, IsString } from 'class-validator';

export class FindSelfHostedLicenseQueryDto {
  @IsNotEmpty()
  @IsString()
  organizationId!: OrganizationId;

  @IsNotEmpty()
  @IsString()
  licenseKey!: string;
}
