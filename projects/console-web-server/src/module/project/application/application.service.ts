import { ProjectApplicationPropCamel, ProjectApplicationWithIcon } from '@dogu-private/console';
import { OrganizationId, ProjectApplicationId, ProjectId, UserId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import crypto from 'crypto';
import path from 'path';
import { DataSource, EntityManager } from 'typeorm';

import fs from 'fs';
import { promisify } from 'util';
import { ProjectApplication } from '../../../db/entity/project-application.entity';
import { Apk } from '../../../sdk/apk';
import { Ipa } from '../../../sdk/ipa';
import { Page } from '../../common/dto/pagination/page';
import { convertExtToProjectAppType, projectAppMeta } from '../../file/project-app-file';
import { ProjectFileService } from '../../file/project-file.service';
import { FindProjectApplicationDto } from './dto/application.dto';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly projectFileService: ProjectFileService,
  ) {}

  async getApplicationList(organizationId: OrganizationId, projectId: ProjectId, dto: FindProjectApplicationDto): Promise<Page<ProjectApplicationWithIcon>> {
    const { version, extension, page, offset } = dto;
    const [applications, count] = await this.dataSource
      .getRepository(ProjectApplication)
      .createQueryBuilder('projectApplication')
      .leftJoinAndSelect(`projectApplication.${ProjectApplicationPropCamel.creator}`, 'creator')
      .where({ organizationId, projectId })
      .andWhere(extension ? 'projectApplication.fileExtension = :extension' : '1=1', { extension: extension })
      .andWhere(version ? 'projectApplication.version LIKE :version' : '1=1', { version: `%${version}%` })
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit())
      .getManyAndCount();

    const requestsAppIconUrl: Promise<string>[] = [];
    for (const application of applications) {
      const appFileType = convertExtToProjectAppType(application.fileExtension);
      if (application.iconFileName === null || !appFileType) {
        requestsAppIconUrl.push(Promise.resolve(`assets/images/apk_default_icon.png`));
      } else {
        requestsAppIconUrl.push(this.projectFileService.getAppDirectory(organizationId, projectId, appFileType).getSignedUrl(application.iconFileName));
      }
    }

    const iconUrls = await Promise.all(requestsAppIconUrl);

    const projectApplicationList: ProjectApplicationWithIcon[] = applications.map((application, id) => {
      const iconUrl: string = iconUrls[id];

      return {
        ...application,
        iconUrl: iconUrl,
      };
    });

    return new Page(page, offset, count, projectApplicationList);
  }

  async getApplicationDownladUrl(id: ProjectApplicationId, organizationId: OrganizationId, projectId: ProjectId) {
    const application = await this.dataSource.getRepository(ProjectApplication).findOne({
      where: {
        projectApplicationId: id,
        organizationId: organizationId,
        projectId: projectId,
      },
    });

    if (application === null) {
      throw new Error(`Application not found: ${id}`);
    }

    const appFileType = convertExtToProjectAppType(application.fileExtension);
    if (!appFileType) {
      return '';
    }
    return await this.projectFileService.getAppDirectory(organizationId, projectId, appFileType).getSignedUrl(application.fileName);
  }

  async getApplicationMeta(name: string, organizationId: OrganizationId, projectId: ProjectId) {}

  async uploadSampleApk(manager: EntityManager, creatorUserId: UserId, organizationId: OrganizationId, projectId: ProjectId): Promise<void> {
    const apkPath = path.resolve(__dirname, '../../../../sample/apk/dogurpgsample.apk');

    const buffer = await promisify(fs.readFile)(apkPath);
    const size = (await promisify(fs.stat)(apkPath)).size;

    const apkFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'dogurpgsample.apk',
      encoding: '7bit',
      mimetype: projectAppMeta.apk.mimeTypes[0],
      buffer: buffer,
      size: size,
    } as Express.Multer.File;

    await this.uploadApplication(manager, apkFile, creatorUserId, organizationId, projectId);
    return;
  }

  async uploadApplication(manager: EntityManager, file: Express.Multer.File, creatorUserId: UserId, organizationId: OrganizationId, projectId: ProjectId) {
    const extension = file.originalname.split('.').pop();
    if (!extension) {
      throw new Error('extension is null');
    }
    const appFileType = convertExtToProjectAppType(extension);
    if (!appFileType) {
      throw new Error(`extension(${appFileType}) is not supported.`);
    }
    const appFileDirectory = this.projectFileService.getAppDirectory(organizationId, projectId, appFileType);

    const randHash = crypto.randomBytes(16).toString('hex');
    const appInfo = await getAppInfo(file, randHash);
    if (!appInfo) {
      throw new Error('extracting appInfo failed');
    }
    const appName = appInfo.name.replaceAll(' ', '_');

    const application = await manager.getRepository(ProjectApplication).findOne({
      where: {
        organizationId: organizationId,
        projectId: projectId,
        package: appInfo.package,
        version: appInfo.version,
        fileExtension: extension,
      },
    });
    const existApplication = application !== null;
    const appFileName = existApplication ? application.fileName : `${appName}-${appInfo.version}-${randHash}.${extension}`;

    let iconFileName = appInfo.icon === null ? null : `${appName}-${appInfo.version}-${randHash}.${appInfo.iconExt}`;
    if (existApplication) {
      iconFileName = application.iconFileName;
    }

    if (existApplication) {
      await manager.getRepository(ProjectApplication).update(
        {
          organizationId: organizationId,
          projectId: projectId,
          package: appInfo.package,
          version: appInfo.version,
          fileExtension: extension,
        },
        {
          name: appName,
          fileSize: file.size,
          package: appInfo.package,
        },
      );

      if (application.iconFileName) {
        await appFileDirectory.delete(application.iconFileName);
      }
      await appFileDirectory.delete(application.fileName);
    } else {
      await manager.getRepository(ProjectApplication).insert({
        organizationId: organizationId,
        projectId: projectId,
        creatorId: creatorUserId,
        name: appName,
        iconFileName: iconFileName,
        fileName: appFileName,
        fileExtension: extension,
        fileSize: file.size,
        package: appInfo.package,
        version: appInfo.version,
      });
    }

    if (appInfo.icon && iconFileName) {
      await appFileDirectory.uploadBuffer(appInfo.icon, iconFileName, ['.png', '.jpg', '.jpeg', 'webp']);
    }
    await appFileDirectory.uploadFile(file, appFileName, projectAppMeta[appFileType].mimeTypes);
  }

  async deleteApplication(id: ProjectApplicationId, organizationId: OrganizationId, projectId: ProjectId) {
    const application = await this.dataSource.getRepository(ProjectApplication).findOne({
      where: {
        projectApplicationId: id,
        organizationId: organizationId,
        projectId: projectId,
      },
    });

    if (application === null) {
      throw new Error(`Application not found: ${id}`);
    }

    const appFileType = convertExtToProjectAppType(application.fileExtension);
    if (!appFileType) {
      throw new Error(`extension(${application.fileExtension}) is not supported.`);
    }
    const appFileDirectory = this.projectFileService.getAppDirectory(organizationId, projectId, appFileType);

    this.dataSource.transaction(async (entityManager) => {
      await entityManager.getRepository(ProjectApplication).delete({
        projectApplicationId: id,
        organizationId: organizationId,
        projectId: projectId,
      });

      await appFileDirectory.delete(application.fileName);
      if (application.iconFileName !== null) {
        await appFileDirectory.delete(application.iconFileName);
      }
    });
  }
}

async function getAppInfo(
  file: Express.Multer.File,
  hash: string,
): Promise<{ name: string; version: string; package: string; icon: Buffer | undefined; iconExt: string } | undefined> {
  const extension = file.originalname.split('.').pop();
  if (extension === 'apk') {
    const info = await Apk.getApkInfo(file.buffer, hash);
    return {
      name: info.name,
      version: info.version,
      package: info.package,
      icon: info.icon,
      iconExt: '.png',
    };
  }
  if (extension === 'ipa') {
    const info = await Ipa.getIpaInfo(file.buffer, hash);
    return {
      name: info.name,
      version: info.version,
      package: info.package,
      icon: info.icon,
      iconExt: '.png',
    };
  }
  return undefined;
}
