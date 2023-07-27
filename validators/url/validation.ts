/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */

import axios, { AxiosRequestConfig } from 'axios';
import fs from 'fs/promises';
import path from 'path';

type CheckedUrls = { [url: string]: boolean };

function findUrls(content: string): string[] {
  const urlRegex = /https?:\/\/[^)\s`\s"\']+/g;
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

async function fetchUrl(filePath: string, exceptionUrls: string[], checkedUrls: CheckedUrls): Promise<boolean> {
  const content = await fs.readFile(filePath, 'utf-8');
  const urls = findUrls(content);

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
      method: 'GET',
      timeout: 5000,
    };

    try {
      await axios.request(config);
      checkedUrls[url] = true;
    } catch (error: any) {
      if (error.response === undefined) {
        delete checkedUrls[url];
        continue;
      }

      const statusCode = error.response.status;
      if (statusCode !== 404) {
        checkedUrls[url] = true;
      }
    }

    console.log(url, checkedUrls[url]);
  }

  return true;
}

export async function validateUrlsInFile(dirPaths: string[], option: { exceptionUrls: string[]; checkedUrls: CheckedUrls }): Promise<void> {
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

        await fetchUrl(absolutePath, option.exceptionUrls, option.checkedUrls);
      } else {
        await validateUrlsInFile([absolutePath], option);
      }
    }
  }
}

export async function validate(dirPaths: string[], args: { exceptionUrls: string[]; checkedUrls: CheckedUrls }) {
  await validateUrlsInFile(dirPaths, args);

  const invalidUrls: string[] = [];
  for (const checkedUrl of Object.keys(args.checkedUrls)) {
    if (!args.checkedUrls[checkedUrl]) {
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
}
