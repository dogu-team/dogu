import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsoleClientService {
  constructor(private readonly httpService: HttpService) {}

  get service(): HttpService {
    return this.httpService;
  }
}
