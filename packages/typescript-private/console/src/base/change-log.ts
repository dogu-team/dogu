import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface ChangeLogTraitsBase {
  changeLogId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ChangeLogBase = ChangeLogTraitsBase;
export const ChangeLogBasePropCamel = propertiesOf<ChangeLogBase>();
export const ChangeLogBasePropSnake = camelToSnakeCasePropertiesOf<ChangeLogBase>();
