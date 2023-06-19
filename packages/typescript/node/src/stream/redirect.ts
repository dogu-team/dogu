import { delay } from '@dogu-tech/common';
import fs from 'fs';

export async function redirectFileToStream(
  filePath: string,
  context: { stop: boolean },
  stream: { write(chunk: any, encoding?: BufferEncoding, cb?: (error: Error | null | undefined) => void): boolean },
): Promise<void> {
  const loopContidion = true;

  // wait until file exsits
  while (loopContidion) {
    await delay(1000);
    if (fs.existsSync(filePath)) {
      break;
    }
    if (context.stop) {
      return;
    }
  }

  let position = 0;
  const length = 65535;
  const buffer = Buffer.alloc(length);

  while (loopContidion) {
    await delay(1000);
    //check if file exist
    if (fs.existsSync(filePath) == false) {
      break;
    }
    if (context.stop && position == fs.statSync(filePath).size) {
      break;
    }
    // read file from position
    const fd = fs.openSync(filePath, 'r');
    const readLength = fs.readSync(fd, buffer, 0, length, position);
    fs.closeSync(fd);
    if (readLength > 0) {
      stream.write(buffer.toString('utf8', 0, readLength));
      position += readLength;
    }
  }
}
