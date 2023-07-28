import compressing from 'compressing';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';
import { HttpClient } from 'typed-rest-client/HttpClient';
import { ChromeVersionFinder } from '../src/chrome-version';

const thirdPartyDir = path.resolve(__dirname, '..', 'third-party');
const versionPrefix = '114.';
// const versionPrefix = 'latest';
const versionFinder = new ChromeVersionFinder();
const version = versionFinder.findSync();
// const { major } = version;
// const versionPrefix = `${major}.`;
const files = [
  {
    postfix: 'mac_arm64.zip',
    destDir: 'darwin/arm64/',
  },
  {
    postfix: 'mac64.zip',
    destDir: 'darwin/x64/',
  },
  {
    postfix: 'linux64.zip',
    destDir: 'linux/x64/',
  },
  {
    postfix: 'win32.zip',
    destDir: 'win32/',
  },
];

interface ChromeBucketResult {
  ListBucketResult: {
    Name: string;
    Prefix: string;

    Contents: {
      Key: string; // ex. "100.0.4896.20/chromedriver_linux64.zip"
      LastModified: string; // ex. "2022-03-04T05:30:39.903Z"
      ETag: string; // ex. hash
      Size: string; // ex. 6258176
    }[];
  };
}

(async (): Promise<void> => {
  const httpc = new HttpClient('');
  const res = await httpc.get('https://chromedriver.storage.googleapis.com/', {});
  const body = await res.readBody();

  const parser = new XMLParser();
  const jObj = parser.parse(body) as ChromeBucketResult;
  // sort contents by lastmodified
  const contents = jObj.ListBucketResult.Contents.sort((a, b) => {
    return a.LastModified < b.LastModified ? 1 : -1;
  });

  console.log(`install chrome driver version `, version);

  for (const f of files) {
    let targetContent = contents.find((c) => c.Key.startsWith(versionPrefix) && c.Key.endsWith(f.postfix))!;

    // if ('latest' !== versionPrefix) {
    //   targetContent = contents.find((c) => c.Key.startsWith(versionPrefix) && c.Key.endsWith(f.postfix))!;
    // }

    console.log(`install chrome driver targetContent`, targetContent);
    const url = `https://chromedriver.storage.googleapis.com/${targetContent.Key}`;

    const majorVersion = targetContent.Key.split('.')[0];

    const res = await httpc.get(url, {});

    const destDir = path.resolve(thirdPartyDir, majorVersion, f.destDir);
    const zipPath = path.resolve(destDir, 'chromedriver.zip');
    console.log(`download ${url} to ${destDir}`);

    await fs.promises.rmdir(destDir, { recursive: true }).catch((e) => {
      console.warn('rmdir failed. ignore.');
    });
    await fs.promises.mkdir(destDir, { recursive: true });
    const file: NodeJS.WritableStream = fs.createWriteStream(zipPath);
    const stream = res.message.pipe(file);
    await res.readBody();
    // const body = await res.readBody();
    // await fs.promises.writeFile(zipPath, body);
    await compressing.zip.uncompress(zipPath, destDir);
    await fs.promises.rm(zipPath);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
