// import webdriver from 'selenium-webdriver';
// import chrome from 'selenium-webdriver/chrome';

// import { pathMap } from './path-map';

// async function main(): Promise<void> {
//   const chromeService = new chrome.ServiceBuilder(pathMap.chromeDriver).build();
//   chrome.setDefaultService(chromeService);

//   const driver = new webdriver.Builder().forBrowser('chrome').build();
//   await driver.get('https://www.naver.com');
// }

// void main();

import { ScreenRecorder, ScreenRecordStopper } from './screen-recorder';

let stopper: ScreenRecordStopper | null = null;
(async (): Promise<void> => {
  stopper = await new ScreenRecorder().start();
})().catch((error) => {
  console.error(error);
});

setInterval(() => {
  console.log('ping');
}, 3000);

setTimeout(() => {
  (async (): Promise<void> => {
    await stopper?.stop();
  })().catch((error) => {
    console.error(error);
  });
}, 60000);
