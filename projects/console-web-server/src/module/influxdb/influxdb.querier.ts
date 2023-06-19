import { QueryApi } from '@influxdata/influxdb-client';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { config } from '../../config';
import { InfluxDbApi } from './influxdb.api';

@Injectable()
export class InfluxDbQuerier implements OnModuleInit {
  private _client: QueryApi | null = null;
  get client(): QueryApi {
    if (!this._client) {
      throw new Error('InfluxDB queryApi is not initialized');
    }
    return this._client;
  }

  constructor(private readonly influxDbApi: InfluxDbApi) {}

  onModuleInit(): void {
    this._client = this.influxDbApi.client.getQueryApi(config.influxdb.org);
  }
}
