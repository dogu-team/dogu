import path from 'path';
import { validate } from './validation';

const exceptionUrls: string[] = ['https://DOGU_HOST:3001'];
const checkedUrls: { [url: string]: boolean } = {};
const docsPath = path.join(__dirname, '../../docs');
const targetPaths = [`${docsPath}/docs`, `${docsPath}/src`, `${docsPath}/i18n`];

(async () => {
  await validate(targetPaths, {
    exceptionUrls,
    checkedUrls,
  });
})();
