import { OrganizationId } from '@dogu-private/types';
import { IsFilledString } from '@dogu-tech/common';
import { IsUUID } from 'class-validator';
import { SelfHostedLicenseUser } from '../auth/guard/self-hosted-license.guard';

export class FindSelfHostedLicenseQueryDto implements Omit<SelfHostedLicenseUser, 'type'> {
  @IsUUID()
  organizationId!: OrganizationId;

  @IsFilledString()
  licenseKey!: string;
}
