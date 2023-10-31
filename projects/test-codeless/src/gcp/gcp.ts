import { Storage } from '@google-cloud/storage';

export enum BucketName {
  WEB_RESPONSIVE_PAGE = 'web-responsive-page',
}

export module GCP {
  const storage = new Storage();

  export async function getBuckets() {
    const buckets = await storage.getBuckets();

    console.log(buckets);

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
      stream.on('error', (err) => {
        reject(err);
      });

      stream.on('finish', () => {
        resolve();
      });

      stream.end(buffer);
    });
  }
}
