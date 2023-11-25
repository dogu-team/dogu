/* eslint-disable @typescript-eslint/promise-function-async */
import { devices, Vendor } from '@dogu-private/device-data';
import { promisify } from 'util';

import { BrowserDriver } from '../browsers/browser';
import { Chrome } from '../browsers/chrome';
import { GTP } from '../tools/gpt';
import { Executor } from './executor';

const wait = promisify(setTimeout);

export class AiExecutor extends Executor {
  private organizationId = '';
  private testExecutorId = '';
  private urls: string[] = [];
  private vendors: Vendor[] = [];

  constructor() {
    super();
  }

  init(): void {
    this.organizationId = process.argv[2];
    this.testExecutorId = process.argv[3];
    this.urls = process.argv[4].split('^');
    this.vendors = process.argv[5].split('^') as Vendor[];

    console.log('ORGANIZATION ID:', this.organizationId);
    console.log('TEST EXECUTOR ID:', this.testExecutorId);
    console.log('URLS:', this.urls);
    console.log('VENDORS:', this.vendors);
  }

  async run(): Promise<void> {
    const device = devices[0];
    const url = this.urls[0];
    const driver = new Chrome(device);

    const texts = await this.runBrowser(driver, url);
    const optimizedTexts: { xpath?: string; text?: string; t?: string }[] = texts;
    for (const item of optimizedTexts) {
      item.t = item.text;

      delete item.xpath;
      delete item.text;
    }

    const initPrompt = `
    사이트에서 로그인을 진행하고, '펄어비스' 주식에 관한 '종합 토론방'에서 글을 작성하는 과정을 자동화합니다.
    현재 사이트의 Xpath와 UI 텍스트 항목: 
    ${JSON.stringify(optimizedTexts)}
    `;

    const a = await GTP.run(initPrompt);
    console.log(a);
  }

  async runBrowser(browser: BrowserDriver, url: string): Promise<{ xpath: string; text: string }[]> {
    await browser.build();
    await browser.open(url);
    await browser.render();
    const texts = await browser.getUITexts();
    await browser.close();

    return texts;
  }
}
