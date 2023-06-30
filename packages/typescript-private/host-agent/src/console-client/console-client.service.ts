import { parseAxiosError } from '@dogu-tech/common';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class ConsoleClientService {
  private _hasIntercepter = false;
  constructor(private readonly httpService: HttpService, private readonly logger: DoguLogger) {}

  get service(): HttpService {
    if (!this._hasIntercepter) {
      this.httpService.axiosRef.interceptors.response.use(
        (response) => {
          return response;
        },
        (error) => {
          throw parseAxiosError(error);
        },
      );
      this._hasIntercepter = true;
    }
    return this.httpService;
  }
}
