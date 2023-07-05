export const PROJECT_SCM_TABLE_NAME = 'project_scm';

export type ProjectScmId = string;
export enum PROJECT_SCM_TYPE {
  UNSPECIFIED = 0,
  GITHUB = 1,
  GITLAB = 2,
  // SNV = 3,
}
