import { OrganizationRoleId, UserId } from '@dogu-private/types';
import { IsFilledString } from '@dogu-tech/common';
import { IsIn, IsNotEmpty, IsUrl } from 'class-validator';
import { OrganizationScmServiceType } from '../..';

export interface UpdateOrganizationDtoBase {
  name: string;
}

export interface CreateOrganizationDtoBase {
  name: string;
}

export interface UpdateOrganizationOwnerDtoBase {
  userId: UserId;
}

export interface UpdateOrganizationRoleDtoBase {
  organizationRoleId: OrganizationRoleId;
}

export class UpdateOrganizationScmDto {
  @IsNotEmpty()
  @IsIn(OrganizationScmServiceType)
  serviceType!: OrganizationScmServiceType;

  @IsNotEmpty()
  @IsUrl()
  url!: string;

  @IsNotEmpty()
  @IsFilledString()
  token!: string;
}
