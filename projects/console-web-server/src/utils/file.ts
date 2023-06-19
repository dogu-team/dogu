import { stringify } from '@dogu-tech/common';
import { BadRequestException, FileValidator, HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';

export class YamlExtensionValidator extends FileValidator {
  constructor(validationOptions?: Record<string, any>) {
    super(validationOptions ?? {});
  }

  isValid(file?: any): boolean {
    if (file && 'originalname' in file) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return ['.yaml', '.yml'].filter((ext) => String(file.originalname).endsWith(ext)).length > 0;
    }
    return false;
  }

  buildErrorMessage(file: any): string {
    return `File ${stringify(file)} is not a yaml file`;
  }
}

export const recordFileParser = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: /webm|mp4/,
  })
  .addMaxSizeValidator({
    // 1024MB
    maxSize: 1024 * 1024 * 1024,
  })
  .build({
    fileIsRequired: true,
    exceptionFactory(error) {
      if (error.includes('size is less than')) {
        throw new BadRequestException('File too large');
      }

      throw new BadRequestException(`Invalid file type. ${error}`);
    },
  });

export const ImageFileParser = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: /jpeg|jpg|png|gif|webp/,
  })
  .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 })
  .build({
    fileIsRequired: true,
    exceptionFactory(error) {
      throw new BadRequestException(`Invalid file type or size exceeded. ${error}`);
    },
  });

export const routineParser = new ParseFilePipeBuilder()
  .addValidator(new YamlExtensionValidator())
  .addFileTypeValidator({
    fileType: /(^application\/octet-stream$|^.*(yaml|yml)$)/,
  })
  .addMaxSizeValidator({
    // 1MB
    maxSize: 1024 * 1024,
  })
  .build({
    fileIsRequired: true,
    exceptionFactory(error) {
      if (error.includes('size is less than')) {
        throw new BadRequestException('File too large');
      }

      throw new BadRequestException(`Invalid file type. ${error}`);
    },
  });

export const applicationFileParser = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: /|(^application\/vnd.android.package-archive|^application\/octet-stream$|^.*(ipa)$)/,
  })
  .addMaxSizeValidator({ maxSize: 1024 * 1024 * 2048 })
  .build({
    fileIsRequired: true,
    exceptionFactory(error) {
      if (error.includes('size is less than')) {
        throw new BadRequestException(`apk file should be under 2GB`);
      }

      throw new BadRequestException(`Invalid file type ${error}`);
    },
  });

export const ImageFilePipeBuiler = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: /jpeg|svg|jpg|png|webp/,
  })
  .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 })
  .build({
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  });
