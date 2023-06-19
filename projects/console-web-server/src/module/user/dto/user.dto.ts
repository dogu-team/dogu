import {
  CreateAdminDtoBase,
  CreateInvitationMemberDtoBase,
  FindProjectsByTeamIdDtoBase,
  FindUsersByOrganizationIdDtoBase,
  FindUsersByTeamIdDtoBase,
  InvitationSignInDtoBase,
  ResetPasswordDtoBase,
  SignInDtoBase,
  UpdateLastOrganizationDtoBase,
  UpdateUserDtoBase,
} from '@dogu-private/console';
import {
  OrganizationId,
  TOKEN_MAX_LENGTH,
  USER_EMAIL_MAX_LENGTH,
  USER_EMAIL_MIN_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USER_PASSWORD_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
} from '@dogu-private/types';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PageDto } from '../../../module/common/dto/pagination/page.dto';

export class CreateAdminDto implements CreateAdminDtoBase {
  @IsNotEmpty()
  @IsString()
  @MinLength(USER_EMAIL_MIN_LENGTH)
  @MaxLength(USER_EMAIL_MAX_LENGTH)
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(USER_NAME_MIN_LENGTH)
  @MaxLength(USER_NAME_MAX_LENGTH)
  name!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  @MaxLength(USER_PASSWORD_MAX_LENGTH)
  password!: string;

  @IsNotEmpty()
  @IsBoolean()
  newsletter!: boolean;

  @IsOptional()
  @IsString()
  invitationOrganizationId?: OrganizationId | undefined;

  @IsOptional()
  @IsString()
  invitationToken?: string | undefined;
}

export class CreateInvitationMemberDto implements CreateInvitationMemberDtoBase {
  @IsNotEmpty()
  @IsString()
  organizationId!: OrganizationId;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(TOKEN_MAX_LENGTH)
  token!: string;

  @IsNotEmpty()
  @IsEmail()
  @MinLength(USER_EMAIL_MIN_LENGTH)
  @MaxLength(USER_EMAIL_MAX_LENGTH)
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(USER_NAME_MIN_LENGTH)
  @MaxLength(USER_NAME_MAX_LENGTH)
  name!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  @MaxLength(USER_PASSWORD_MAX_LENGTH)
  password!: string;

  @IsNotEmpty()
  @IsBoolean()
  newsletter!: boolean;
}

export class FindUsersByOrganizationIdDto extends PageDto implements FindUsersByOrganizationIdDtoBase {
  @IsOptional()
  @IsString()
  @Type(() => String)
  keyword = '';
}

export class FindUsersByTeamIdDto extends PageDto implements FindUsersByTeamIdDtoBase {
  @IsOptional()
  @IsString()
  @Type(() => String)
  keyword = '';
}

export class FindProjectsByTeamIdDto extends PageDto implements FindProjectsByTeamIdDtoBase {
  @IsOptional()
  @IsString()
  @Type(() => String)
  keyword = '';
}

export class ResetPasswordDto implements ResetPasswordDtoBase {
  @IsNotEmpty()
  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  @MaxLength(USER_PASSWORD_MAX_LENGTH)
  currentPassword!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  @MaxLength(USER_PASSWORD_MAX_LENGTH)
  newPassword!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  @MaxLength(USER_PASSWORD_MAX_LENGTH)
  confirmPassword!: string;
}

export class SignInDto implements SignInDtoBase {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  @MaxLength(USER_PASSWORD_MAX_LENGTH)
  password!: string;

  @IsOptional()
  @IsString()
  invitationOrganizationId?: OrganizationId | undefined;

  @IsOptional()
  @IsString()
  invitationToken?: string | undefined;
}

export class InvitationSignInDto implements InvitationSignInDtoBase {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  @MaxLength(USER_PASSWORD_MAX_LENGTH)
  password!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(TOKEN_MAX_LENGTH)
  token!: string;

  @IsNotEmpty()
  @IsString()
  organizationId!: string;
}

export class UpdateUserDto implements UpdateUserDtoBase {
  @IsOptional()
  @IsString()
  @MinLength(USER_NAME_MIN_LENGTH)
  @MaxLength(USER_NAME_MAX_LENGTH)
  name?: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string;
}

export class UpdateLastOrganizationDto implements UpdateLastOrganizationDtoBase {
  @IsNotEmpty()
  @IsString()
  organizationId!: string;
}
