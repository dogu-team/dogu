import path from 'path';
import { validate } from './validation';

const exceptionUrls: string[] = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
const checkedUrls: { [url: string]: boolean } = {};
const docsPath = path.join(__dirname, '../../projects/console-web-front');
const targetPaths = [`${docsPath}/src`, `${docsPath}/pages`, `${docsPath}/locales`, `${docsPath}/emails`];

(async () => {
  await validate(targetPaths, {
    exceptionUrls,
    checkedUrls,
  });
})();
