import { CREATOR_TYPE, ProjectId, UserId } from '@dogu-private/types';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Project } from '../../../../../db/entity/project.entity';
import { ApplicationService } from '../../../../../module/project/application/application.service';

@Injectable()
export class V1ProjectService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(ApplicationService)
    private readonly applicationService: ApplicationService,
  ) {}

  async uploadApplication(file: Express.Multer.File, projectId: ProjectId, creatorUserId: UserId | null, creatorType: CREATOR_TYPE) {
    const project = await this.dataSource.getRepository(Project).findOne({
      where: { projectId },
    });

    const organizationId = project!.organizationId!;

    await this.dataSource.transaction(async (manager) => {
      await this.applicationService.uploadApplication(manager, file, creatorUserId, creatorType, organizationId, projectId);
    });
  }
}
