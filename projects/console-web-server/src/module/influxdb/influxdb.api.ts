import { InfluxDB } from '@influxdata/influxdb-client';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { config } from '../../config';

@Injectable()
export class InfluxDbApi implements OnModuleInit {
  private _client: InfluxDB | null = null;
  get client(): InfluxDB {
    if (!this._client) {
      throw new Error('InfluxDB client is not initialized');
    }
    return this._client;
  }

  onModuleInit(): void {
    this._client = new InfluxDB({
      url: config.influxdb.url,
      token: config.influxdb.token,
      timeout: 30000,
    });
  }
}
