import { ChangeLogId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ChangeLogUserReactionBase } from '..';

export interface ChangeLogRelationTraits {
  userReactions?: ChangeLogUserReactionBase[];
}

export interface ChangeLogTraitsBase {
  changeLogId: ChangeLogId;
  tags: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ChangeLogBase = ChangeLogTraitsBase & ChangeLogRelationTraits;
export const ChangeLogBasePropCamel = propertiesOf<ChangeLogBase>();
export const ChangeLogBasePropSnake = camelToSnakeCasePropertiesOf<ChangeLogBase>();
