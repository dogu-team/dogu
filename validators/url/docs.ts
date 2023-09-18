import path from 'path';
import { validate } from './validation';

const exceptionUrls: string[] = [
  'https://DOGU_HOST:3001',
  'https://api.dogutech.io/v1/projects/${projectId}/applications',
  'https://api.dogutech.io/v1/projects/${projectId}/routines/${routineId}/pipelines',
  'https://github.com/dogu-team/${props.repo_name}.git',
];
const checkedUrls: { [url: string]: boolean } = {};
const docsPath = path.join(__dirname, '../../docs');
const targetPaths = [`${docsPath}/docs`, `${docsPath}/src`, `${docsPath}/i18n`];

(async () => {
  await validate(targetPaths, {
    exceptionUrls,
    checkedUrls,
  });
})();
