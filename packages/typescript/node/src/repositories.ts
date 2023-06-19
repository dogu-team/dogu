export const RepositoryType = ['git', 'svn', 'perforce'] as const;
export type RepositoryType = typeof RepositoryType[number];

export interface RepositoryConfig {
  type: RepositoryType;
  url: string;
  branch: string;
  subpath: string;
  userName: string;
  userPassword: string;
}
