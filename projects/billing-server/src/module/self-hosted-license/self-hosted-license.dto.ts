import { OrganizationId } from '@dogu-private/types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SelfHostedLicenseUser } from '../auth/guard/self-hosted-license.guard';

export class FindSelfHostedLicenseQueryDto implements Omit<SelfHostedLicenseUser, 'type'> {
  @IsString()
  @IsOptional()
  organizationId!: OrganizationId | null;

  @IsNotEmpty()
  @IsString()
  licenseKey!: string;
}
