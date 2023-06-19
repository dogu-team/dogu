import { Module } from '@nestjs/common';
import { FeatureFileModule } from '../feature/file/feature-file.module';
import { OrganizationFileService } from './organization-file.service';
import { ProjectFileService } from './project-file.service';
import { PublicFileService } from './public-file.service';
import { UserFileService } from './user-file.service';

@Module({
  imports: [FeatureFileModule],
  providers: [OrganizationFileService, ProjectFileService, UserFileService, PublicFileService],
  exports: [OrganizationFileService, ProjectFileService, UserFileService, PublicFileService],
})
export class FileModule {}
