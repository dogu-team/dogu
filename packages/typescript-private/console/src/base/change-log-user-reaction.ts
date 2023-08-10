import { ChangeLogReactionType, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface ChangeLogUserReactionTraitsBase {
  changeLogUserReactionId: string;
  changeLogId: string;
  userId: UserId;
  reactionType: ChangeLogReactionType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ChangeLogUserReactionBase = ChangeLogUserReactionTraitsBase;
export const ChangeLogUserReactionBasePropCamel = propertiesOf<ChangeLogUserReactionBase>();
export const ChangeLogUserReactionBasePropSnake = camelToSnakeCasePropertiesOf<ChangeLogUserReactionBase>();
