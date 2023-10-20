import { BrowserDriver } from './browser';
import { Chrome } from './chrome';
import { Safari } from './safari';

(async () => {
  const url = 'https://dogutech.io/ko';

  const browsers: BrowserDriver[] = [new Chrome('chrome'), new Safari('safari')];

  await Promise.all(
    browsers.map((browser) => {
      return browser.build();
    }),
  );

  await Promise.all(
    browsers.map((browser) => {
      return browser.open(url);
    }),
  );

  await Promise.all(
    browsers.map((browser) => {
      return browser.render();
    }),
  );

  await Promise.all(
    browsers.map((browser) => {
      return browser.takeScreenshot();
    }),
  );

  await Promise.all(
    browsers.map((browser) => {
      return browser.mergeVertically();
    }),
  );

  await Promise.all(
    browsers.map((browser) => {
      return browser.close();
    }),
  );
})();
