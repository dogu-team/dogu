import { Storage } from '@google-cloud/storage';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';

process.env.GOOGLE_APPLICATION_CREDENTIALS = `${path.join(__dirname, '../../dogu-project-379607-f41da1c1d175.json')}`;

export enum BucketName {
  WEB_RESPONSIVE_PAGE = 'web-responsive-page',
}

export module GCP {
  type ServiceKey = 'WEB_RESPONSIVE';
  const serviceUrls: { [name in ServiceKey]: string } = {
    WEB_RESPONSIVE: 'https://hello-4bfnb5q6vq-du.a.run.app',
  };
  const storage = new Storage();

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

  export async function runService(serviceKey: ServiceKey) {
    const serviceUrl = serviceUrls[serviceKey];
    const idToken = await getIdToken(serviceUrl);

    try {
      const { data } = await axios.get(serviceUrl, { headers: { Authorization: `Bearer ${idToken}` } });
    } catch (error) {
      console.log(error);
    }
  }
}
