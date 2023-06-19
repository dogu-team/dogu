import { Module } from '@nestjs/common';
import { YamlLoaderService } from './yaml-loader/yaml-loader.service';

@Module({
  imports: [],
  exports: [YamlLoaderService],
  providers: [YamlLoaderService],
  controllers: [],
})
export class InitModule {}
