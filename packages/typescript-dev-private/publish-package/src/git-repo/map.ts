interface PackageGithubMap {
  [packageName: string]: {
    [env: string]: string;
  };
}

export const PackageGithubMap: PackageGithubMap = {
  '@dogu-actions/run-test': {
    development: `https://oneofthezombies:${process.env.DOGU_ACTIONS_PUBLISH_TOKEN}@github.com/dogu-actions/run-test.git`,
    production: `https://oneofthezombies:${process.env.DOGU_ACTIONS_PUBLISH_TOKEN}@github.com/dogu-actions/run-test.git`,
  },
  '@dogu-actions/prepare': {
    development: `https://oneofthezombies:${process.env.DOGU_ACTIONS_PUBLISH_TOKEN}@github.com/dogu-actions/prepare.git`,
    production: `https://oneofthezombies:${process.env.DOGU_ACTIONS_PUBLISH_TOKEN}@github.com/dogu-actions/prepare.git`,
  },
  '@dogu-user-templates/typescript-template': {
    development: `https://root:${process.env.DOGU_GITLAB_ROOT_TOKEN}@gitlab.dev.dogutech.io/dogu/typescript-template.git`,
    production: `https://root:${process.env.DOGU_GITLAB_ROOT_TOKEN}@gitlab.dogutech.io/dogu/typescript-template.git`,
  },
};
