import { REPOSITORY_TYPE } from '@dogu-private/types';

export interface UpdateProjectGitDtoBase {
  service: REPOSITORY_TYPE;
  token: string;
  repoUrl: string;
  configUrl: string;
}
