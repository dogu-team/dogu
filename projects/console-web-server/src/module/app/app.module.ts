import { RedisModule } from '@liaoliaots/nestjs-redis';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config, dataSourceConfig } from '../../config';
import { RecordModule } from '../../enterprise/module/record/record.module';
import { FEATURE_CONFIG } from '../../feature.config';
import { LoggerMiddleware } from '../../middleware/logger.middleware';
import { TokenModule } from '../../module/token/token.module';
import { DeviceStreamingModule } from '../../ws/device-streaming/device-streaming.module';
import { LiveLogModule } from '../../ws/live-log/live-log.module';
import { LivePipelineStatusModule } from '../../ws/live-pipeline-status/live-pipeline-status.module';
import { LiveProfileModule } from '../../ws/live-profile/live-profile.module';
import { RemoteGamiumModule } from '../../ws/remote-gamium/remote-gamium.module';
import { AuthModule } from '../auth/auth.module';
import { DeviceMessageModule } from '../device-message/device-message.module';
import { DownloadModule } from '../download/download.module';
import { EventModule } from '../event/event.module';
import { FeatureModule } from '../feature/feature.module';
import { FeatureFileModule } from '../feature/file/feature-file.module';
import { FileModule } from '../file/file.module';
import { GitlabModule } from '../gitlab/gitlab.module';
import { InitModule } from '../init/init.module';
import { LoggerModule } from '../logger/logger.module';
import { OpenApiMoudule } from '../open-api/open-api.module';
import { DeviceTagModule } from '../organization/device-tag/device-tag.module';
import { DeviceModule } from '../organization/device/device.module';
import { HostModule } from '../organization/host/host.module';
import { OrganizationModule } from '../organization/organization.module';
import { TeamModule } from '../organization/team/team.module';
import { PrivateModule } from '../private/private.module';
import { ProjectRoleModule } from '../project-role/project-role.module';
import { ProjectModule } from '../project/project.module';
import { PublicModule } from '../public/public.module';
import { RegisteryModule } from '../registery/registery.module';
import { RemoteModule } from '../remote/remote.module';
import { RoutineModule } from '../routine/routine.module';
import { UserModule } from '../user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const BASE_MODULES = [
  TypeOrmModule.forRoot(dataSourceConfig),
  RedisModule.forRoot({
    config: config.redis.options,
  }),
  EventEmitterModule.forRoot({
    delimiter: '.',
  }),
  ScheduleModule.forRoot(),
  RegisteryModule,
  OrganizationModule,
  ProjectModule,
  HostModule,
  UserModule,
  DeviceModule,
  TokenModule,
  DeviceTagModule,
  TeamModule,
  ProjectRoleModule,
  LiveLogModule,
  EventModule,
  PrivateModule,
  DeviceMessageModule,
  InitModule,
  RoutineModule,
  LoggerModule,
  DeviceStreamingModule,
  DownloadModule,
  PublicModule,
  LivePipelineStatusModule,
  LiveProfileModule,
  GitlabModule,
  FeatureModule,
  FeatureFileModule,
  AuthModule,
  FileModule,
  RemoteModule,
  RemoteGamiumModule,
  OpenApiMoudule,
];

const MODULES =
  FEATURE_CONFIG.get('defaultEdition') === 'enterprise' //
    ? [...BASE_MODULES, RecordModule]
    : BASE_MODULES;

@Module({
  imports: MODULES,
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
