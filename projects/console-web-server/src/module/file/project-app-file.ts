import { OrganizationId, ProjectId } from '@dogu-private/types';
import { FeatureFileService } from '../feature/file/feature-file.service';

export type ProjectAppType = 'apk' | 'ipa';

export function convertExtToProjectAppType(ext: string): ProjectAppType | null {
  if (ext === 'apk') {
    return 'apk';
  } else if (ext === 'ipa') {
    return 'ipa';
  }
  return null;
}

export type ProjectAppMeta = {
  [key in ProjectAppType]: {
    mimeTypes: string[];
  };
};

export const projectAppMeta: ProjectAppMeta = {
  apk: {
    mimeTypes: ['application/vnd.android.package-archive', 'application/octet-stream'],
  },
  ipa: {
    mimeTypes: ['application/octet-stream'],
  },
};

export class ProjectAppDirectory {
  constructor(
    public readonly organizationId: OrganizationId,
    public readonly projectId: ProjectId,
    public readonly type: ProjectAppType,
    private readonly featureFileService: FeatureFileService,
  ) {}

  async getSignedUrl(fileName: string): Promise<string> {
    const filePath = this.getFilePath(fileName);
    const getSignedUrlResult = await this.featureFileService.getSignedUrl({
      bucketKey: 'organization',
      key: filePath,
      expires: 60 * 1,
    });
    return getSignedUrlResult.url;
  }

  async delete(fileName: string): Promise<void> {
    const filePath = this.getFilePath(fileName);
    const deleteResult = await this.featureFileService.delete({
      bucketKey: 'organization',
      key: filePath,
    });
  }

  async uploadFile(file: Express.Multer.File, fileName: string, supportedMimes: string[]): Promise<string> {
    const isMimeMatch = supportedMimes.some((mime) => mime === file.mimetype);
    if (!isMimeMatch) {
      throw new Error(`File type ${file.mimetype} is not supported`);
    }

    const apkPath = this.getFilePath(fileName);
    const putResult = await this.featureFileService.put({
      bucketKey: 'organization',
      key: apkPath,
      body: file.buffer,
      contentType: file.mimetype,
    });
    return putResult.location;
  }

  async uploadBuffer(data: Buffer, fileName: string, supportedExts: string[]): Promise<string> {
    const isExtMatch = fileName && supportedExts.some((fileType) => fileName.toLowerCase().endsWith(fileType));
    if (!isExtMatch) {
      throw new Error(`File type ${fileName} is not supported`);
    }

    const iconPath = this.getFilePath(fileName);
    const putResult = await this.featureFileService.put({
      bucketKey: 'organization',
      key: iconPath,
      body: data,
    });
    return putResult.location;
  }

  private getFilePath(fileName: string): string {
    return `${this.getBasePath()}/${fileName}`;
  }

  private getBasePath(): string {
    let dirName = '';
    switch (this.type) {
      case 'apk':
        dirName = 'apks';
        break;
      case 'ipa':
        dirName = 'ipas';
        break;
      default:
        throw new Error('Invalid directory type');
    }

    return `organizations/${this.organizationId}/projects/${this.projectId}/${dirName}`;
  }
}
