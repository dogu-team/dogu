import { setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { getConsoleBaseUrl } from './console-url';

@Injectable()
export class ConsoleClientService {
  private _client: AxiosInstance;

  constructor() {
    this._client = axios.create({
      baseURL: getConsoleBaseUrl(),
    });
    setAxiosErrorFilterToIntercepter(this._client);
  }

  get client(): AxiosInstance {
    return this._client;
  }
}
