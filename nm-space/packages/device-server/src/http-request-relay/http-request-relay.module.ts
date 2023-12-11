import { ClassProvider, Module } from '@nestjs/common';
import { AxiosHttpRequestRelayService } from './axios.http-request-relay.service';
import { HttpRequestRelayService } from './http-request-relay.common';

const HttpRequestRelayServiceProvider: ClassProvider = {
  provide: HttpRequestRelayService,
  useClass: AxiosHttpRequestRelayService,
};

@Module({
  providers: [HttpRequestRelayServiceProvider],
  exports: [HttpRequestRelayServiceProvider],
})
export class HttpRequestRelayModule {}
