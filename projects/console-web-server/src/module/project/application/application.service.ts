import { ProjectApplicationPropCamel, ProjectApplicationWithIcon } from '@dogu-private/console';
import { CREATOR_TYPE, OrganizationId, ProjectApplicationId, ProjectId, UserId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import crypto from 'crypto';
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
    const { version, extension, latestOnly, page, offset } = dto;

    const [applications, count] = await this.dataSource
      .getRepository(ProjectApplication)
      .createQueryBuilder('projectApplication')
      .leftJoinAndSelect(`projectApplication.${ProjectApplicationPropCamel.creator}`, 'creator')
      .where({ organizationId, projectId })
      .andWhere(extension ? 'projectApplication.fileExtension = :extension' : '1=1', { extension: extension })
      .andWhere(latestOnly ? 'projectApplication.isLatest = 1' : version ? 'projectApplication.version LIKE :version' : '1=1', { version: `%${version}%` })
      .orderBy('projectApplication.isLatest', 'DESC')
      .addOrderBy('projectApplication.createdAt', 'DESC')
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit())
      .getManyAndCount();

    const projectApplicationList = await this.getAppIcons(organizationId, projectId, applications);

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

  async getApplicationWithUniquePackage(organizationId: OrganizationId, projectId: ProjectId, dto: FindProjectApplicationDto): Promise<ProjectApplicationWithIcon[]> {
    const { extension } = dto;

    const applications = await this.dataSource
      .getRepository(ProjectApplication)
      .createQueryBuilder('projectApplication')
      .leftJoinAndSelect(`projectApplication.${ProjectApplicationPropCamel.creator}`, 'creator')
      .where({ organizationId, projectId })
      .andWhere(extension ? 'projectApplication.fileExtension = :extension' : '1=1', { extension: extension })
      .andWhere('projectApplication.isLatest = 1')
      .orderBy('projectApplication.createdAt', 'DESC')
      .getMany();

    const uniquePackageApplications: ProjectApplication[] = [];
    const uniquePackageSet = new Set(applications.map((application) => application.package));

    for (const application of applications) {
      if (uniquePackageSet.size === 0) {
        break;
      }

      if (uniquePackageSet.has(application.package)) {
        uniquePackageApplications.push(application);
        uniquePackageSet.delete(application.package);
      }
    }

    const projectApplicationList = await this.getAppIcons(organizationId, projectId, uniquePackageApplications);

    return projectApplicationList;
  }

  async uploadSampleApk(manager: EntityManager, sampleAppPath: string, creatorUserId: UserId, organizationId: OrganizationId, projectId: ProjectId): Promise<void> {
    const buffer = await promisify(fs.readFile)(sampleAppPath);
    const size = (await promisify(fs.stat)(sampleAppPath)).size;

    const apkFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'dogurpgsample.apk',
      encoding: '7bit',
      mimetype: projectAppMeta.apk.mimeTypes[0],
      buffer: buffer,
      size: size,
    } as Express.Multer.File;

    await this.uploadApplication(manager, apkFile, creatorUserId, CREATOR_TYPE.USER, organizationId, projectId);
    return;
  }

  async uploadApplication(
    manager: EntityManager,
    file: Express.Multer.File,
    creatorUserId: UserId | null,
    creatorType: CREATOR_TYPE,
    organizationId: OrganizationId,
    projectId: ProjectId,
  ) {
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

    const applications = await manager.getRepository(ProjectApplication).find({
      where: {
        organizationId: organizationId,
        projectId: projectId,
        package: appInfo.package,
        fileExtension: extension,
      },
    });

    const duplicatedVersionCodeApp = applications.find((app) => app.versionCode === appInfo.versionCode);
    const duplicatedVersionApp = applications.find((app) => app.version === appInfo.version);

    if (duplicatedVersionCodeApp) {
      await manager.getRepository(ProjectApplication).softRemove(duplicatedVersionCodeApp);
    } else if (duplicatedVersionApp) {
      await manager.getRepository(ProjectApplication).softRemove(duplicatedVersionApp);
    }

    const isLatest =
      applications.length === 0
        ? true
        : !!duplicatedVersionApp
        ? Math.max(...applications.filter((app) => app.projectApplicationId !== duplicatedVersionApp.projectApplicationId).map((app) => app.versionCode)) <= appInfo.versionCode
        : Math.max(...applications.map((app) => app.versionCode)) <= appInfo.versionCode;
    const fileName = `${appName}-${appInfo.version}-${appInfo.versionCode}-${randHash}.${extension}`;
    const iconFileName = appInfo.icon === undefined ? null : `${appName}-${appInfo.version}-${appInfo.versionCode}-${randHash}.${appInfo.iconExt}`;

    const latestApp = applications.find((app) => app.isLatest === 1);

    if (latestApp) {
      await manager.getRepository(ProjectApplication).update(
        {
          projectApplicationId: latestApp.projectApplicationId,
          organizationId: organizationId,
          projectId: projectId,
        },
        {
          isLatest: 0,
        },
      );
    }

    await manager.getRepository(ProjectApplication).insert({
      organizationId: organizationId,
      projectId: projectId,
      creatorId: creatorUserId,
      creatorType,
      name: appName,
      iconFileName,
      fileName,
      fileExtension: extension,
      fileSize: file.size,
      package: appInfo.package,
      version: appInfo.version,
      versionCode: appInfo.versionCode,
      isLatest: isLatest ? 1 : 0,
    });

    if (appInfo.icon && iconFileName) {
      await appFileDirectory.uploadBuffer(appInfo.icon, iconFileName, ['.png', '.jpg', '.jpeg', 'webp'], file.mimetype);
    }
    await appFileDirectory.uploadFile(file, fileName, projectAppMeta[appFileType].mimeTypes);
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

      const samePackageApplications = await entityManager.getRepository(ProjectApplication).find({
        where: {
          organizationId: organizationId,
          projectId: projectId,
          package: application.package,
          fileExtension: application.fileExtension,
        },
      });

      if (samePackageApplications.length > 0) {
        const latestApplication = samePackageApplications.reduce((prev, current) => {
          return prev.versionCode > current.versionCode ? prev : current;
        });

        await entityManager.getRepository(ProjectApplication).update(
          {
            projectApplicationId: latestApplication.projectApplicationId,
            organizationId: organizationId,
            projectId: projectId,
          },
          {
            isLatest: 1,
          },
        );
      }

      await appFileDirectory.delete(application.fileName);
      if (application.iconFileName !== null) {
        await appFileDirectory.delete(application.iconFileName);
      }
    });
  }

  private async getAppIcons(organizationId: OrganizationId, projectId: ProjectId, applications: ProjectApplication[]): Promise<ProjectApplicationWithIcon[]> {
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

    return projectApplicationList;
  }
}

async function getAppInfo(
  file: Express.Multer.File,
  hash: string,
): Promise<{ name: string; version: string; versionCode: number; package: string; icon: Buffer | undefined; iconExt: string } | undefined> {
  const extension = file.originalname.split('.').pop();
  if (extension === 'apk') {
    const info = await Apk.getApkInfo(file.buffer, hash);
    return {
      name: info.name,
      version: info.version,
      versionCode: info.versionCode,
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
      // use CFBundleVersion as versionCode
      versionCode: info.bundleVersion,
      package: info.package,
      icon: info.icon,
      iconExt: '.png',
    };
  }
  return undefined;
}
