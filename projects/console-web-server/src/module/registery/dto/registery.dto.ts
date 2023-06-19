import {
  ResetPasswordWithTokenDtoBase,
  SendVerifyEmailDtoBase,
  SubscribeNewsletterDtoBase,
  UnsubscribeNewsletterDtoBase,
  ValidationResetPasswordDtoBase,
  VerifyEmailDtoBase,
} from '@dogu-private/console';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordWithToken implements ResetPasswordWithTokenDtoBase {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  token!: string;

  @IsNotEmpty()
  @IsString()
  newPassword!: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword!: string;
}

export class SendVerifyEmailDto implements SendVerifyEmailDtoBase {
  @IsNotEmpty()
  @IsEmail()
  @MinLength(4)
  @MaxLength(256)
  email!: string;
}

export class VerifyEmailDto implements VerifyEmailDtoBase {
  @IsNotEmpty()
  @IsString()
  token!: string;

  @IsNotEmpty()
  @IsEmail()
  @MinLength(4)
  @MaxLength(256)
  email!: string;
}

export class SubscribeNewsletterDto implements SubscribeNewsletterDtoBase {
  @IsNotEmpty()
  @IsEmail()
  @MinLength(4)
  @MaxLength(256)
  email!: string;

  @IsNotEmpty()
  @IsString()
  captcha!: string;
}

export class UnsubscribeNewsletterDto implements UnsubscribeNewsletterDtoBase {
  @IsNotEmpty()
  @IsEmail()
  @MinLength(4)
  @MaxLength(256)
  email!: string;

  @IsNotEmpty()
  @IsString()
  token!: string;
}

export class ValidationResetPasswordDto implements ValidationResetPasswordDtoBase {
  @IsNotEmpty()
  @IsEmail()
  @MinLength(4)
  @MaxLength(256)
  email!: string;

  @IsNotEmpty()
  @IsString()
  token!: string;
}
