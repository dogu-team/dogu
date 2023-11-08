import { File, GetSignedUrlConfig, Storage } from '@google-cloud/storage';
import { exec } from 'child_process';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

process.env.GOOGLE_APPLICATION_CREDENTIALS = `${path.join(__dirname, '../../dogu-project-379607-f41da1c1d175.json')}`;

export enum BucketName {
  TEST_EXECUTOR = 'dogu-test-executor',
}

export module GCP {
  type JobKey = 'test-executor-web-responsive';
  const storage = new Storage();

  export async function init() {}

  async function getAccessToken(): Promise<string> {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const response = await client.getAccessToken();
    const token = response.token;

    if (!token) {
      throw new Error('Failed to get access token');
    }

    return token;
  }

  async function getIdToken(serivceUrl: string): Promise<string> {
    const auth = new GoogleAuth();
    const client = await auth.getIdTokenClient(serivceUrl);
    const response = await client.request({ url: serivceUrl });
    const token = response.config.headers!['Authorization'].split(' ')[1];

    if (!token) {
      throw new Error('Failed to get access token');
    }

    return token;
  }

  export async function getBuckets() {
    const buckets = await storage.getBuckets();
    return buckets;
  }

  export async function getFiles(bucketName: BucketName, prefix: string, delimiter = '/'): Promise<File[]> {
    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({ prefix, delimiter });

    return files;
  }

  export async function getSignedFileUrl(bucketName: BucketName, filePath: string, expiresSeconds: number): Promise<string> {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    const signedUrlConfig: GetSignedUrlConfig = {
      action: 'read',
      expires: Date.now() + expiresSeconds * 1000,
    };

    const [url] = await file.getSignedUrl(signedUrlConfig);
    return url;
  }

  export async function putImage(bucketName: BucketName, filePath: string, buffer: Buffer, type: string): Promise<void> {
    const bucket = storage.bucket(bucketName);

    const file = bucket.file(filePath);
    const stream = file.createWriteStream({
      metadata: {
        contentType: type,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (err: any) => {
        reject(err);
      });

      stream.on('finish', () => {
        resolve();
      });

      stream.end(buffer);
    });
  }

  export async function runJob(jobKey: JobKey, args: string[]): Promise<string> {
    const { stderr } = await execAsync(`yes | gcloud beta run jobs execute ${jobKey} --args=${args.join(',')}`);

    const lines = stderr.split('\n');
    const lastLine = lines[lines.length - 2];

    if (lastLine) {
      const parts = lastLine.split('/');

      const index = parts.indexOf('details') + 2;
      if (index < parts.length) {
        const executionId = parts[index];
        return executionId;
      }
    }

    throw new Error(`Failed to parse task ID: ${lastLine}`);
  }

  // export async function runService(serviceKey: ServiceKey) {
  //   const serviceUrl = serviceUrls[serviceKey];
  //   const idToken = await getIdToken(serviceUrl);

  //   try {
  //     const { data } = await axios.get(serviceUrl, { headers: { Authorization: `Bearer ${idToken}` } });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
}
