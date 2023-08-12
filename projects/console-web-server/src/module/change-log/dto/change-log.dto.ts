import { UpdateReactionToChangeLogDtoBase } from '@dogu-private/console';
import { ChangeLogId, ChangeLogReactionType } from '@dogu-private/types';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdateReactionToChangeLogDto implements UpdateReactionToChangeLogDtoBase {
  @IsNotEmpty()
  @IsEnum(ChangeLogReactionType)
  reactionType!: ChangeLogReactionType;
}
