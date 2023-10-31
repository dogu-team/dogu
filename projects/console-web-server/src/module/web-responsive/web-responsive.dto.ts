import { Vendor } from '@dogu-private/device-data';
import { OrganizationId } from '@dogu-private/types';

import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateWebResponsiveDto {
  @IsNotEmpty()
  @IsString()
  organizationId!: OrganizationId;

  @IsNotEmpty()
  @IsArray()
  vendors!: Vendor[];

  @IsNotEmpty()
  @IsArray()
  urls!: string[];
}
