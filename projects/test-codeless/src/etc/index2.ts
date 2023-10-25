import { webkit } from 'playwright';
import { promisify } from 'util';

const wait = promisify(setTimeout);

(async () => {
  const browser = await webkit.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://toss.im');

  await page.evaluate('window.scrollBy(0, document.body.scrollHeight)');
  await wait(3000);
  await page.evaluate('window.scrollBy(0, 0)');

  await page.screenshot({ path: `example.png`, fullPage: true });
  await browser.close();
})();
