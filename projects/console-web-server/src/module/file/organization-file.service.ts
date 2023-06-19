import { OrganizationId } from '@dogu-private/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import path from 'path';
import { FeatureFileService } from '../feature/file/feature-file.service';

@Injectable()
export class OrganizationFileService {
  constructor(private readonly featureFileService: FeatureFileService) {}

  async uploadProfileImage(file: Express.Multer.File, organizationId: OrganizationId): Promise<string> {
    const imageExtension = path.extname(file.originalname).toLowerCase().replace('.', '');

    const isImageExtension = imageExtension === 'jpg' || imageExtension === 'jpeg' || imageExtension === 'png';
    if (!isImageExtension) {
      throw new HttpException('Invalid file type', HttpStatus.BAD_REQUEST);
    }

    const putResult = await this.featureFileService.put({
      bucketKey: 'organization',
      key: `organizations/${organizationId}/profile.${imageExtension}`,
      body: file.buffer,
      contentType: file.mimetype,
      acl: 'public-read',
    });
    return putResult.location;
  }
}
