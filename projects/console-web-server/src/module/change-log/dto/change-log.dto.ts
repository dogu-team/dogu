import { UpdateReactionToChangeLogDtoBase } from '@dogu-private/console';
import { ChangeLogReactionType } from '@dogu-private/types';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateReactionToChangeLogDto implements UpdateReactionToChangeLogDtoBase {
  @IsNotEmpty()
  @IsEnum(ChangeLogReactionType)
  reactionType!: ChangeLogReactionType;
}
