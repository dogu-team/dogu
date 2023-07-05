import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class ConsoleClientService {
  constructor(private readonly httpService: HttpService, private readonly logger: DoguLogger) {}

  get service(): HttpService {
    return this.httpService;
  }
}
