/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */

import axios, { AxiosRequestConfig } from 'axios';
import fs from 'fs/promises';
import path from 'path';

const exceptionUrls: string[] = ['https://DOGU_HOST:3001'];
const checkedUrls: { [url: string]: boolean } = {};

function searchUrls(content: string): string[] {
  const urlRegex = /https?:\/\/[^)\s`\s"]+/g;
  const urls = content.match(urlRegex);

  if (urls === null) {
    return [];
  }

  const sanitizedUrls = urls.map((url) => {
    if (url.charAt(url.length - 1) === '.') {
      return url.slice(0, -1);
    }
    return url;
  });

  return sanitizedUrls;
}

async function validateUrl(filePath: string): Promise<boolean> {
  const content = await fs.readFile(filePath, 'utf-8');
  const urls = searchUrls(content);

  for (const url of urls) {
    if (exceptionUrls.includes(url)) {
      continue;
    }

    if (Object.keys(checkedUrls).includes(url)) {
      continue;
    }

    checkedUrls[url] = false;
    const config: AxiosRequestConfig = {
      url,
      method: 'HEAD',
      timeout: 5000,
    };

    try {
      await axios.request(config);
      checkedUrls[url] = true;
    } catch (error) {
      const statusCode = error.response.status;
      if (statusCode !== 404) {
        checkedUrls[url] = true;
      }
    }
  }

  return true;
}

async function validate(dirPaths: string[]): Promise<void> {
  for (const dirPath of dirPaths) {
    const pathNames = await fs.readdir(dirPath);

    for (const pathName of pathNames) {
      const absolutePath = path.join(dirPath, pathName);
      const isFile = (await fs.stat(absolutePath)).isFile();

      if (isFile) {
        const fileExtension = path.extname(absolutePath);

        switch (fileExtension) {
          case '.js':
            continue;
        }

        await validateUrl(absolutePath);
      } else {
        await validate([absolutePath]);
      }
    }
  }
}

const docsPath = path.join(__dirname, '../');

(async () => {
  await validate([`${docsPath}/docs`, `${docsPath}/src`, `${docsPath}/i18n`]);

  const invalidUrls: string[] = [];
  for (const checkedUrl of Object.keys(checkedUrls)) {
    if (!checkedUrls[checkedUrl]) {
      invalidUrls.push(checkedUrl);
    }
  }

  if (invalidUrls.length !== 0) {
    let error = '';
    for (const invalidUrl of invalidUrls) {
      error += `\n${invalidUrl}`;
    }

    console.error(`Invalid URLs: ${error}`);
    process.exit(1);
  }

  console.log('URL validation completed.');
})();
