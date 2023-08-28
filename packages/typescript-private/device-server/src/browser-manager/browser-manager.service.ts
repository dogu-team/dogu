import { Injectable } from '@nestjs/common';
import { BrowserManager } from './browser-manager';

@Injectable()
export class BrowserManagerService extends BrowserManager {}
