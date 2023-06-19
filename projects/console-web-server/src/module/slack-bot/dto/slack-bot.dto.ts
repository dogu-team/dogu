import { ContactDtoBase, FeedbackDtoBase } from '@dogu-private/console';
import { IsFilledString } from '@dogu-tech/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ContactDto implements ContactDtoBase {
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  organization!: string;

  @IsNotEmpty()
  @IsString()
  message!: string;
}

export class FeedbackDto implements FeedbackDtoBase {
  @IsNotEmpty()
  @IsFilledString()
  feedback!: string;
}
