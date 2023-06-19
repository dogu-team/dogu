import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { env } from '../env';
import { DeviceClientService } from './device-client.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        baseURL: `http://${env.DOGU_DEVICE_SERVER_HOST_PORT}`,
      }),
    }),
  ],
  providers: [DeviceClientService],
  exports: [DeviceClientService],
})
export class DeviceClientModule {}
