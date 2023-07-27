import { WriteApi } from '@influxdata/influxdb-client';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { config } from '../../config';
import { InfluxDbApi } from './influxdb.api';

@Injectable()
export class InfluxDbWriter implements OnModuleInit {
  private _client: WriteApi | null = null;
  get client(): WriteApi {
    if (!this._client) {
      throw new Error('InfluxDB writeApi is not initialized');
    }
    return this._client;
  }

  constructor(private readonly influxDbApi: InfluxDbApi) {}

  onModuleInit(): void {
    this._client = this.influxDbApi.client.getWriteApi(config.influxdb.org, config.influxdb.bucket, 'ns');
  }
}
