import { CreateTokenDtoBase, TokenType } from '@dogu-private/console';
import { OrganizationId, USER_EMAIL_MAX_LENGTH, USER_EMAIL_MIN_LENGTH } from '@dogu-private/types';
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateTokenDto implements CreateTokenDtoBase {
  @IsOptional()
  @IsDate()
  expiredAt?: Date;

  @IsNotEmpty()
  @IsEnum(TokenType)
  type!: TokenType;

  @IsNotEmpty()
  @IsEmail()
  @MinLength(USER_EMAIL_MIN_LENGTH)
  @MaxLength(USER_EMAIL_MAX_LENGTH)
  email!: string;

  @IsNotEmpty()
  @IsUUID()
  organizationId!: OrganizationId | null;
}
