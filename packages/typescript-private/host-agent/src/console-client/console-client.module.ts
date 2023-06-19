import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { env } from '../env';
import { ConsoleClientService } from './console-client.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        baseURL: env.DOGU_API_BASE_URL.endsWith('/') ? env.DOGU_API_BASE_URL.slice(0, -1) : env.DOGU_API_BASE_URL,
      }),
    }),
  ],
  providers: [ConsoleClientService],
  exports: [ConsoleClientService],
})
export class ConsoleClientModule {}
