import { ChangeLogId, ChangeLogReactionType, ChangeLogUserReactionId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ChangeLogBase, UserBase } from '..';

export interface ChangeLogUserReactionRelationTraits {
  changeLog?: ChangeLogBase;
  user?: UserBase;
}

export interface ChangeLogUserReactionTraitsBase {
  changeLogUserReactionId: ChangeLogUserReactionId;
  changeLogId: ChangeLogId;
  userId: UserId;
  reactionType: ChangeLogReactionType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ChangeLogUserReactionBase = ChangeLogUserReactionTraitsBase & ChangeLogUserReactionRelationTraits;
export const ChangeLogUserReactionBasePropCamel = propertiesOf<ChangeLogUserReactionBase>();
export const ChangeLogUserReactionBasePropSnake = camelToSnakeCasePropertiesOf<ChangeLogUserReactionBase>();
