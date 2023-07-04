export const PROJECT_REPOSITORY_TABLE_NAME = 'project_repository';

export type ProjectRepositoryId = string;
export enum REPOSITORY_TYPE {
  UNSPECIFIED = 0,
  GITHUB = 1,
  GITLAB = 2,
  // SNV = 3,
}
