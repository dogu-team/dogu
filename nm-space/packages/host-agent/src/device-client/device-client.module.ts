import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DeviceAuthModule } from '../device-auth/device-auth.module';
import { env } from '../env';
import { DeviceClientService } from './device-client.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        baseURL: `http://${env.DOGU_DEVICE_SERVER_HOST_PORT}`,
      }),
    }),
    DeviceAuthModule,
  ],
  providers: [DeviceClientService],
  exports: [DeviceClientService],
})
export class DeviceClientModule {}
