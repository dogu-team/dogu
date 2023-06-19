import { AcceptUserInvitationDtoBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { IsFilledString } from '@dogu-tech/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AcceptUserInvitationDto implements AcceptUserInvitationDtoBase {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  organizationId!: OrganizationId;

  @IsNotEmpty()
  @IsFilledString()
  token!: string;
}
