import { setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { env } from '../env';

@Injectable()
export class ConsoleClientService {
  private _client: AxiosInstance;

  constructor() {
    this._client = axios.create({
      baseURL: env.DOGU_API_BASE_URL.endsWith('/') ? env.DOGU_API_BASE_URL.slice(0, -1) : env.DOGU_API_BASE_URL,
    });
    setAxiosErrorFilterToIntercepter(this._client);
  }

  get client(): AxiosInstance {
    return this._client;
  }
}
