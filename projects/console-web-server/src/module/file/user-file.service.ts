import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import path from 'path';
import { FeatureFileService } from '../feature/file/feature-file.service';

@Injectable()
export class UserFileService {
  constructor(private readonly featureFileService: FeatureFileService) {}

  async updateProfileImage(file: Express.Multer.File, userId: string): Promise<string> {
    const extension = path.extname(file.originalname).toLowerCase().replace('.', '');

    const isImageExtension = extension === 'jpg' || extension === 'jpeg' || extension === 'png';
    if (!isImageExtension) {
      throw new HttpException('Invalid file type', HttpStatus.BAD_REQUEST);
    }

    const putResult = await this.featureFileService.put({
      bucketKey: 'user',
      key: `users/${userId}/profile.${extension}`,
      body: file.buffer,
      contentType: file.mimetype,
      acl: 'public-read',
    });

    return putResult.location;
  }
}
