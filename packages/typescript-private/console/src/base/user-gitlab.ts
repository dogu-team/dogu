import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface UserGitlabBase {
  userId: string;
  gitlabUserId: number;
  gitlabToken: string;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const UserGitlabPropCamel = propertiesOf<UserGitlabBase>();
export const UserGitlabPropSnake = camelToSnakeCasePropertiesOf<UserGitlabBase>();
