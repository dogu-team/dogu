import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface UserEmailPreferenceBase {
  userId: string;
  newsletter: number;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const UserEmailPreferencePropCamel = propertiesOf<UserEmailPreferenceBase>();
export const UserEmailPreferencePropSnake = camelToSnakeCasePropertiesOf<UserEmailPreferenceBase>();
