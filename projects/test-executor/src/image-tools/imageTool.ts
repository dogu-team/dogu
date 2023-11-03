import sharp, { Sharp } from 'sharp';

export module ImageTool {
  export async function mergeVertically(imagesBase64: string[]): Promise<Sharp> {
    const imageBuffers = await Promise.all(
      imagesBase64.map((imageBase64) => {
        return Buffer.from(imageBase64, 'base64');
      }),
    );

    const images = imageBuffers.map((buffer) => {
      const image = sharp(buffer, {});
      return image;
    });

    const metaDatas = await Promise.all(
      images.map((image) => {
        return image.metadata();
      }),
    );

    const maxHeight = metaDatas.reduce((acc, cur) => {
      return acc + cur.height!;
    }, 0);

    const canvas = sharp({
      create: {
        width: metaDatas[0].width!,
        height: maxHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    });

    let currentHeight = 0;
    canvas.composite(
      imageBuffers.map((buffer, index) => {
        const options: any = {
          input: buffer,
          top: currentHeight,
          left: 0,
        };

        currentHeight += metaDatas[index].height!;

        return options;
      }),
    );

    const jpegBuffer = await canvas
      .jpeg({
        quality: 80,
      })
      .toBuffer();

    const resizedWidth = Math.round(metaDatas[0].width! / 2);
    const resizedHeight = Math.round(maxHeight / 2);

    const resizedImage = sharp(jpegBuffer, {}).resize({
      width: resizedWidth,
      height: resizedHeight,
    });

    return resizedImage;
  }

  export async function cropImage(imageBase64: string, lastHeight: number): Promise<string> {
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const image = sharp(imageBuffer, {});

    const metaDatas = await image.metadata();
    const imageWidth = metaDatas.width!;
    const imageHeight = metaDatas.height!;
    const cropStartY = imageHeight - lastHeight;

    image.extract({
      width: imageWidth,
      height: lastHeight,
      top: cropStartY,
      left: 0,
    });

    await image
      .jpeg({
        quality: 100,
      })
      .toFile('cropped.jpeg');

    const buffer = await image
      .jpeg({
        quality: 100,
      })
      .toBuffer();

    const base64 = buffer.toString('base64');

    return base64;
  }
}
