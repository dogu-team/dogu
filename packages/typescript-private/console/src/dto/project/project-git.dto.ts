import { PROJECT_SCM_TYPE } from '@dogu-private/types';

export interface UpdateProjectGitDtoBase {
  service: PROJECT_SCM_TYPE;
  token: string;
  url: string;
}
