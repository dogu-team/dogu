import {
  CreateOrganizationDtoBase,
  FindInvitationsDtoBase,
  InviteEmailDtoBase,
  UpdateOrganizationDtoBase,
  UpdateOrganizationOwnerDtoBase,
  UpdateOrganizationRoleDtoBase,
} from '@dogu-private/console';
import { OrganizationRoleId, ORGANIZATION_NAME_MAX_LENGTH, USER_INVITATION_STATUS } from '@dogu-private/types';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { PageDto } from '../../common/dto/pagination/page.dto';

export class createOrganizationDto implements CreateOrganizationDtoBase {
  @IsNotEmpty()
  @IsString()
  @MaxLength(ORGANIZATION_NAME_MAX_LENGTH)
  name!: string;
}

export class UpdateOrganizationDto implements UpdateOrganizationDtoBase {
  @IsNotEmpty()
  @IsString()
  @MaxLength(ORGANIZATION_NAME_MAX_LENGTH)
  name!: string;
}

export class UpdateOrganizationOwnerDto implements UpdateOrganizationOwnerDtoBase {
  @IsNotEmpty()
  @IsString()
  userId!: string;
}

export class UpdateOrganizationRoleDto implements UpdateOrganizationRoleDtoBase {
  @IsNotEmpty()
  @IsNumber()
  organizationRoleId!: OrganizationRoleId;
}

export class InviteEmailDto implements InviteEmailDtoBase {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsNumber()
  organizationRoleId!: OrganizationRoleId;
}

export class FindInvitationsDto extends PageDto implements FindInvitationsDtoBase {
  @IsOptional()
  @IsEnum(USER_INVITATION_STATUS)
  status = USER_INVITATION_STATUS.PENDING;
}
