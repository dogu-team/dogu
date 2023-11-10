import CloudRunClient from '@google-cloud/run';
import { google } from '@google-cloud/run/build/protos/protos';
import { File, GetSignedUrlConfig, Storage } from '@google-cloud/storage';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PROJECT_ID = 'dogu-project-379607';
process.env.GOOGLE_APPLICATION_CREDENTIALS = `${path.join(__dirname, '../../dogu-project-379607-f41da1c1d175.json')}`;

export enum BucketName {
  TEST_EXECUTOR = 'dogu-test-executor',
}

export enum JobName {
  TEST_EXECUTOR_WEB_RESPONSIVE = 'test-executor-web-responsive',
}

export module GCP {
  const storageClient = new Storage();
  const executionClient = new CloudRunClient.ExecutionsClient();

  // export async function init() {
  //   const auth = new GoogleAuth({
  //     scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  //   });

  //   client = (await auth.getClient()) as JSONClient;
  // }

  // async function getAccessToken(): Promise<string> {
  //   const response = await client.getAccessToken();
  //   const token = response.token;

  //   if (!token) {
  //     throw new Error('Failed to get access token');
  //   }

  //   return token;
  // }

  // async function getIdToken(serivceUrl: string): Promise<string> {
  //   const client = await auth.getIdTokenClient(serivceUrl);
  //   const response = await client.request({ url: serivceUrl });
  //   const token = response.config.headers!['Authorization'].split(' ')[1];

  //   if (!token) {
  //     throw new Error('Failed to get access token');
  //   }

  //   return token;
  // }

  export async function getBuckets() {
    const buckets = await storageClient.getBuckets();
    return buckets;
  }

  export async function getFiles(bucketName: BucketName, prefix: string, delimiter = '/'): Promise<File[]> {
    const bucket = storageClient.bucket(bucketName);
    const [files] = await bucket.getFiles({ prefix, delimiter });

    return files;
  }

  export async function getSignedFileUrl(bucketName: BucketName, filePath: string, expiresSeconds: number): Promise<string> {
    const bucket = storageClient.bucket(bucketName);
    const file = bucket.file(filePath);

    const signedUrlConfig: GetSignedUrlConfig = {
      action: 'read',
      expires: Date.now() + expiresSeconds * 1000,
    };

    const [url] = await file.getSignedUrl(signedUrlConfig);
    return url;
  }

  export async function putImage(bucketName: BucketName, filePath: string, buffer: Buffer, type: string): Promise<void> {
    const bucket = storageClient.bucket(bucketName);

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

  export async function runJob(jobName: JobName, args: string[]): Promise<string> {
    const [organizationId, testExecutorId, urls, vendors] = args;
    const cli = `yes | gcloud beta run jobs execute ${jobName} --args="${organizationId}" --args="${testExecutorId}" --args="${urls}" --args="${vendors}"`;
    const { stderr } = await execAsync(cli);

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

    throw new Error(`Failed to parse execution ID: ${lastLine}`);
  }

  export async function getJobExecution(location: string, jobName: JobName, executionId: string): Promise<google.cloud.run.v2.IExecution> {
    const name = executionClient.executionPath(PROJECT_ID, location, jobName, executionId);
    const [execution] = await executionClient.getExecution({ name });

    return execution;
  }
}
