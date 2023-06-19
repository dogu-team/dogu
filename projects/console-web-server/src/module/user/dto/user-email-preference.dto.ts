import { CreateUserEmailPreferenceDtoBase, UpdateUserEmailPreferenceDtoBase } from '@dogu-private/console';
import { IsIn, IsNumber } from 'class-validator';

export class CreateUserEmailPreferenceDto implements CreateUserEmailPreferenceDtoBase {
  @IsNumber()
  @IsIn([0, 1])
  newsletter!: number;
}

export class UpdateUserEmailPreferenceDto implements UpdateUserEmailPreferenceDtoBase {
  @IsNumber()
  @IsIn([0, 1])
  newsletter!: number;
}
