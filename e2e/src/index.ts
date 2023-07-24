import webdriver from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

import { pathMap } from './path-map';

async function main(): Promise<void> {
  const chromeService = new chrome.ServiceBuilder(pathMap.chromeDriver).build();
  chrome.setDefaultService(chromeService);

  const driver = new webdriver.Builder().forBrowser('chrome').build();
  await driver.get('https://www.naver.com');
}

void main();
