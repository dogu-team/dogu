import { OrganizationApplicationPropCamel, OrganizationApplicationWithIcon } from '@dogu-private/console';
import { CREATOR_TYPE, OrganizationId, UserId } from '@dogu-private/types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import crypto from 'crypto';
import fs from 'fs';
import { DataSource, EntityManager } from 'typeorm';
import { promisify } from 'util';
import { v4 } from 'uuid';

import { OrganizationApplication } from '../../../db/entity/organization-application.entity';
import { Apk } from '../../../sdk/apk';
import { Ipa } from '../../../sdk/ipa';
import { Page } from '../../common/dto/pagination/page';
import { convertExtToOrganizationAppType, organizationAppMeta } from '../../file/organization-app-file';
import { OrganizationFileService } from '../../file/organization-file.service';
import { FindOrganizationApplicationByPackageNameDto, FindOrganizationApplicationDto } from './application.dto';

@Injectable()
export class OrganizationApplicationService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly organizationFileService: OrganizationFileService,
  ) {}

  async findApplications(organizationId: string, dto: FindOrganizationApplicationDto): Promise<Page<OrganizationApplicationWithIcon>> {
    const { version, extension, latestOnly, page, offset } = dto;

    const [applications, count] = await this.dataSource
      .getRepository(OrganizationApplication)
      .createQueryBuilder('organizationApplication')
      .leftJoinAndSelect(`organizationApplication.${OrganizationApplicationPropCamel.creator}`, 'creator')
      .where({ organizationId })
      .andWhere(dto.extension ? `organizationApplication.${OrganizationApplicationPropCamel.fileExtension} = :extension` : '1=1', { extension: dto.extension })
      .andWhere(latestOnly ? 'organizationApplication.isLatest = 1' : version ? 'organizationApplication.version LIKE :version' : '1=1', { version: `%${version}%` })
      .orderBy('organizationApplication.isLatest', 'DESC')
      .addOrderBy('organizationApplication.createdAt', 'DESC')
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit())
      .getManyAndCount();

    const projectApplicationList = await this.getAppIcons(organizationId, applications);

    return new Page(page, offset, count, projectApplicationList);
  }

  async findUniquePackageApplications(organizationId: string, dto: FindOrganizationApplicationByPackageNameDto): Promise<Page<OrganizationApplicationWithIcon>> {
    const [applications, count] = await this.dataSource
      .getRepository(OrganizationApplication)
      .createQueryBuilder('organizationApplication')
      .leftJoinAndSelect(`organizationApplication.${OrganizationApplicationPropCamel.creator}`, 'creator')
      .where({ organizationId })
      .andWhere(dto.extension ? `organizationApplication.${OrganizationApplicationPropCamel.fileExtension} = :extension` : '1=1', { extension: dto.extension })
      .orderBy(`organizationApplication.${OrganizationApplicationPropCamel.name}`, 'ASC')
      .addOrderBy(`organizationApplication.${OrganizationApplicationPropCamel.fileExtension}`, 'ASC')
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit())
      .getManyAndCount();

    const latestUploadedAppMap: Map<string, OrganizationApplication> = new Map();

    for (const application of applications) {
      const key = application.package + application.fileExtension;
      const latestUploadedApp = latestUploadedAppMap.get(key);

      if (latestUploadedApp) {
        if (new Date(latestUploadedApp.createdAt).getTime() < new Date(application.createdAt).getTime()) {
          latestUploadedAppMap.set(key, application);
        }
      } else {
        latestUploadedAppMap.set(key, application);
      }
    }

    const appsFromMap = Array.from(latestUploadedAppMap.values());
    const uniquePackageApps = await this.getAppIcons(organizationId, appsFromMap);

    return new Page(dto.page, dto.offset, count, uniquePackageApps);
  }

  async findApplicationsByPackageName(
    organizationId: string,
    packageName: string,
    dto: FindOrganizationApplicationByPackageNameDto,
  ): Promise<Page<OrganizationApplicationWithIcon>> {
    const { extension } = dto;
    const [applications, count] = await this.dataSource
      .getRepository(OrganizationApplication)
      .createQueryBuilder('organizationApplication')
      .leftJoinAndSelect(`organizationApplication.${OrganizationApplicationPropCamel.creator}`, 'creator')
      .where({ organizationId })
      .andWhere(extension ? `organizationApplication.${OrganizationApplicationPropCamel.fileExtension} = :extension` : '1=1', { extension })
      .andWhere('organizationApplication.package = :packageName', { packageName })
      .orderBy('organizationApplication.isLatest', 'DESC')
      .addOrderBy('organizationApplication.createdAt', 'DESC')
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit())
      .getManyAndCount();

    const projectApplicationList = await this.getAppIcons(organizationId, applications);

    return new Page(dto.page, dto.offset, count, projectApplicationList);
  }

  async getApplicationDownladUrl(id: string, organizationId: OrganizationId): Promise<string> {
    const application = await this.dataSource.getRepository(OrganizationApplication).findOne({
      where: {
        organizationApplicationId: id,
        organizationId: organizationId,
      },
    });

    if (application === null) {
      throw new Error(`Application not found: ${id}`);
    }

    const appFileType = convertExtToOrganizationAppType(application.fileExtension);
    if (!appFileType) {
      throw new BadRequestException(`App extension(${application.fileExtension}) is not supported.`);
    }

    return await this.organizationFileService.getAppDirectory(organizationId, appFileType).getSignedUrl(application.fileName);
  }

  async uploadApplication(
    manager: EntityManager,
    file: Express.Multer.File,
    creatorUserId: UserId | null,
    creatorType: CREATOR_TYPE,
    organizationId: OrganizationId,
  ): Promise<OrganizationApplication> {
    const extension = file.originalname.split('.').pop();
    if (!extension) {
      throw new Error('extension is null');
    }
    const appFileType = convertExtToOrganizationAppType(extension);
    if (!appFileType) {
      throw new Error(`extension(${appFileType}) is not supported.`);
    }
    const appFileDirectory = this.organizationFileService.getAppDirectory(organizationId, appFileType);

    const randHash = crypto.randomBytes(16).toString('hex');
    const appInfo = await getAppInfo(file, randHash);
    if (!appInfo) {
      throw new Error('extracting appInfo failed');
    }
    const appName = appInfo.name.replaceAll(' ', '_');

    const applications = await manager.getRepository(OrganizationApplication).find({
      where: {
        organizationId: organizationId,
        package: appInfo.package,
        fileExtension: extension,
      },
    });

    const duplicatedVersionCodeApp = applications.find((app) => app.versionCode === appInfo.versionCode);
    const duplicatedVersionApp = applications.find((app) => app.version === appInfo.version);

    if (duplicatedVersionCodeApp) {
      await manager.getRepository(OrganizationApplication).softRemove(duplicatedVersionCodeApp);
    } else if (duplicatedVersionApp) {
      await manager.getRepository(OrganizationApplication).softRemove(duplicatedVersionApp);
    }

    const isLatest =
      applications.length === 0
        ? true
        : duplicatedVersionApp
        ? Math.max(...applications.filter((app) => app.organizationApplicationId !== duplicatedVersionApp.organizationApplicationId).map((app) => app.versionCode)) <=
          appInfo.versionCode
        : Math.max(...applications.map((app) => app.versionCode)) <= appInfo.versionCode;
    const fileName = `${appName}-${appInfo.version}-${appInfo.versionCode}-${randHash}.${extension}`;
    const iconFileName = appInfo.icon === undefined ? null : `${appName}-${appInfo.version}-${appInfo.versionCode}-${randHash}.${appInfo.iconExt}`;

    const latestApp = applications.find((app) => app.isLatest === 1);

    if (latestApp) {
      await manager.getRepository(OrganizationApplication).update(
        {
          organizationApplicationId: latestApp.organizationApplicationId,
          organizationId: organizationId,
        },
        {
          isLatest: 0,
        },
      );
    }

    if (appInfo.icon && iconFileName) {
      await appFileDirectory.uploadBuffer(appInfo.icon, iconFileName, ['.png', '.jpg', '.jpeg', 'webp'], file.mimetype);
    }
    await appFileDirectory.uploadFile(file, fileName, organizationAppMeta[appFileType].mimeTypes);

    const newApp = manager.getRepository(OrganizationApplication).create({
      organizationApplicationId: v4(),
      organizationId: organizationId,
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
    return await manager.getRepository(OrganizationApplication).save(newApp);
  }

  async uploadSampleApk(manager: EntityManager, sampleAppPath: string, creatorUserId: UserId, organizationId: OrganizationId): Promise<void> {
    const buffer = await promisify(fs.readFile)(sampleAppPath);
    const size = (await promisify(fs.stat)(sampleAppPath)).size;

    const apkFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'dogurpgsample.apk',
      encoding: '7bit',
      mimetype: organizationAppMeta.apk.mimeTypes[0],
      buffer: buffer,
      size: size,
    } as Express.Multer.File;

    await this.uploadApplication(manager, apkFile, creatorUserId, CREATOR_TYPE.USER, organizationId);
    return;
  }

  async deleteApplicationByPackage(organizationId: OrganizationId, packageName: string): Promise<void> {
    const applications = await this.dataSource.getRepository(OrganizationApplication).find({
      where: {
        organizationId: organizationId,
        package: packageName,
      },
    });

    await this.dataSource.transaction(async (entityManager) => {
      for (const application of applications) {
        await entityManager.getRepository(OrganizationApplication).delete({
          organizationApplicationId: application.organizationApplicationId,
          organizationId: organizationId,
        });

        const appFileType = convertExtToOrganizationAppType(application.fileExtension);
        if (!appFileType) {
          throw new Error(`extension(${application.fileExtension}) is not supported.`);
        }
        const appFileDirectory = this.organizationFileService.getAppDirectory(organizationId, appFileType);

        await appFileDirectory.delete(application.fileName);
        if (application.iconFileName !== null) {
          await appFileDirectory.delete(application.iconFileName);
        }
      }
    });
  }

  async deleteApplication(id: string, organizationId: OrganizationId): Promise<void> {
    const application = await this.dataSource.getRepository(OrganizationApplication).findOne({
      where: {
        organizationApplicationId: id,
        organizationId: organizationId,
      },
    });

    if (application === null) {
      throw new Error(`Application not found: ${id}`);
    }

    const appFileType = convertExtToOrganizationAppType(application.fileExtension);
    if (!appFileType) {
      throw new Error(`extension(${application.fileExtension}) is not supported.`);
    }
    const appFileDirectory = this.organizationFileService.getAppDirectory(organizationId, appFileType);

    await this.dataSource.transaction(async (entityManager) => {
      await entityManager.getRepository(OrganizationApplication).delete({
        organizationApplicationId: id,
        organizationId: organizationId,
      });

      const samePackageApplications = await entityManager.getRepository(OrganizationApplication).find({
        where: {
          organizationId: organizationId,
          package: application.package,
          fileExtension: application.fileExtension,
        },
      });

      if (samePackageApplications.length > 0) {
        const latestApplication = samePackageApplications.reduce((prev, current) => {
          return prev.versionCode > current.versionCode ? prev : current;
        });

        await entityManager.getRepository(OrganizationApplication).update(
          {
            organizationApplicationId: latestApplication.organizationApplicationId,
            organizationId: organizationId,
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

  private async getAppIcons(organizationId: OrganizationId, applications: OrganizationApplication[]): Promise<OrganizationApplicationWithIcon[]> {
    const requestsAppIconUrl: Promise<string>[] = [];
    for (const application of applications) {
      const appFileType = convertExtToOrganizationAppType(application.fileExtension);
      if (application.iconFileName === null || !appFileType) {
        requestsAppIconUrl.push(Promise.resolve(`assets/images/apk_default_icon.png`));
      } else {
        requestsAppIconUrl.push(this.organizationFileService.getAppDirectory(organizationId, appFileType).getSignedUrl(application.iconFileName));
      }
    }

    const iconUrls = await Promise.all(requestsAppIconUrl);

    const orgApplicationList: OrganizationApplicationWithIcon[] = applications.map((application, id) => {
      const iconUrl: string = iconUrls[id];

      return {
        ...application,
        iconUrl: iconUrl,
      };
    });

    return orgApplicationList;
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
