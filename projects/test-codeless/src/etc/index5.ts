import fs from 'fs/promises';
import path from 'path';
import { ImageTool } from './display-size-checker/imageTool';

(async () => {
  const image = await fs.readFile(path.resolve(__dirname, '../../screenshot_9180.jpeg'));
  const base64 = image.toString('base64');

  console.log('@');

  const croppedBase64 = await ImageTool.cropImage(base64, 198 * 2);

  console.log('H');

  await fs.writeFile(path.resolve(__dirname, '../../cropped2.jpeg'), Buffer.from(croppedBase64, 'base64'));
})();
