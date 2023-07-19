/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */

import fs from 'fs/promises';
import http, { IncomingMessage, RequestOptions } from 'http';
import path from 'path';

const exceptionUrls: string[] = ['https://DOGU_HOST:3001'];
const checkedUrls: { [url: string]: boolean } = {};

function fetchHead(options: RequestOptions): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      res.on('data', () => {});

      res.on('end', () => {
        resolve(res);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

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

    const urlObject = new URL(url);
    const options: RequestOptions = {
      host: urlObject.host,
      path: urlObject.pathname,
      method: 'HEAD',
      timeout: 5000,
    };

    checkedUrls[url] = false;
    const response = await fetchHead(options);
    if (response.statusCode !== 404) {
      checkedUrls[url] = true;
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

  const invalidUrls = [];
  for (const checkedUrl of Object.keys(checkedUrls)) {
    if (!checkedUrls[checkedUrl]) {
      invalidUrls.push(checkedUrl);
    }
  }

  if (invalidUrls.length !== 0) {
    throw new Error(`Invalid URLs: ${invalidUrls}`);
  }

  console.log('URL validation completed.');
})();
