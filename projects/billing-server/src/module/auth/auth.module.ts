import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([CloudLicense, SelfHostedLicense])],
  exports: [],
  providers: [],
  controllers: [],
})
export class AuthModule {}
