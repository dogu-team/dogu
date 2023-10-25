import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import lodash from 'lodash';
import { Configuration, OpenAIApi } from 'openai';
import path from 'path';
import { Browser, Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { URL } from 'url';
import { promisify } from 'util';

const configuration = new Configuration({
  apiKey: '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',
  organization: 'org-WyY7l0TVzpwkGSKShwNDPTHr',
});
const openai = new OpenAIApi(configuration);

const wait = promisify(setTimeout);

(async () => {
  const options = new chrome.Options();
  // options.setChromeBinaryPath(`${path.join(__dirname, '/chromedriver')}`)
  // console.log(`${path.join(__dirname, '/chromedriver')}`)
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--window-size=3820,2160');
  const driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();

  const url = 'https://www.thehyundai.com/Home.html';
  const urlObject = new URL(url);

  await wait(1000);

  await driver.get(url);
  await wait(1000);
  await driver.manage().window().maximize();
  await wait(1000);

  await driver.executeScript('window.scrollBy(0,document.body.scrollHeight)', '');
  await wait(1000);
  await driver.executeScript('window.scrollTo(0, 0);', '');
  await wait(1000);

  const cdp = await driver.createCDPConnection('page');
  const pageRect = await cdp.send('Page.getLayoutMetrics', {});
  const width = pageRect['result']['contentSize']['width'];
  const height = pageRect['result']['contentSize']['height'];

  for (let currentHeight = 0; currentHeight < height; currentHeight += 4096) {
    const nextHeight = currentHeight + 4096 > height ? height % 4096 : 4096;

    const screenshotConfig = {
      format: 'jpeg',
      quality: 30,
      captureBeyondViewport: true,
      fromSurface: true,
      clip: { width: width, height: nextHeight, x: 0, y: currentHeight, scale: 1 },
    };

    const base64 = await cdp.send('Page.captureScreenshot', screenshotConfig);
    await fs.writeFile(path.join(__dirname, `screenshot_${currentHeight / 4096}.jpeg`), base64['result']['data'], 'base64');
  }

  // const width = await driver.executeScript(`return document.body.scrollWidth`, '');
  // const height = await driver.executeScript(`return document.body.scrollHeight`, '');

  // console.log(width, height);

  const pageSource = await driver.getPageSource();
  const $ = cheerio.load(pageSource);
  const body = $('body')[0];

  const texts: {
    text: string;
    bottom: number;
    height: number;
    left: number;
    right: number;
    top: number;
    width: number;
    x: number;
    y: number;
  }[] = [];

  function createXPath(element: cheerio.Element) {
    let xpath = '';
    let currentElement = element;
    //@ts-ignore
    if (element.name === undefined) {
      currentElement = element.parent;
    }

    //@ts-ignore
    while (currentElement && currentElement.type !== 'root') {
      //@ts-ignore
      let siblings = currentElement.parent.children.filter((child) => child.type === 'tag');
      //@ts-ignore
      let tagName = currentElement.tagName;
      //@ts-ignore
      let sameTagSiblings = siblings.filter((child) => child.tagName === tagName);
      let tagIndex = sameTagSiblings.indexOf(currentElement) + 1;
      xpath = '/' + tagName + '[' + tagIndex + ']' + xpath;
      currentElement = currentElement.parent;
    }

    return '/' + xpath;
  }

  async function extractText(node: cheerio.Element) {
    if (node.type === 'text') {
      const textNode = node as cheerio.TextElement;
      if (textNode.data) {
        const text = textNode.data.trim();
        if (text.length !== 0) {
          const xpath = createXPath(node);
          const boundingRect: Object = await driver.executeScript(
            `return document.evaluate('${xpath}', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.getBoundingClientRect()`,
            '',
          );

          //@ts-ignore
          if (boundingRect['width'] === 0 || boundingRect['height'] === 0) {
            return;
          }

          const textObj = lodash.merge(boundingRect, { text: text });
          //@ts-ignore
          texts.push(textObj);
        }
      }
    } else if (node.type === 'tag' && node.name !== 'script' && node.children) {
      for (const child of node.children) {
        await extractText(child);
      }
    }
  }

  const imageUrls: string[] = [];
  function extractImage(node: cheerio.Element) {
    if (node.type === 'tag' && node.name === 'img') {
      const src = node.attribs.src;
      if (src) {
        if (!imageUrls.includes(src)) {
          imageUrls.push(src);
        }
      }
    } else if (node.type === 'tag' && node.children) {
      node.children.forEach((childNode: any) => extractImage(childNode));
    }
  }

  await extractText(body);
  extractImage(body);

  const prompt = `아래 목록에서 문법 또는 철자가 틀린 것을 알려주세요
  
  ${texts.map((text) => text.text).join('\n')}
  `;

  console.log(prompt);

  const chatCompletion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  console.log(chatCompletion.data.choices[0].message?.content);

  // const links: string[] = [];
  // function extractLinks(node: cheerio.Element) {
  //   if (node.type === 'tag' && node.name === 'a') {
  //     const href = node.attribs.href;
  //     if (href) {
  //       if (href.startsWith('/')) {
  //         const linkUrl = `${url}${href}`;
  //         if (!links.includes(linkUrl)) {
  //           links.push(linkUrl);
  //         }
  //       }

  //       if (href.includes(urlObject.hostname)) {
  //         if (!links.includes(href)) {
  //           links.push(href);
  //         }
  //       }
  //     }
  //   } else if (node.type === 'tag' && node.children) {
  //     node.children.forEach((childNode: any) => extractLinks(childNode));
  //   }
  // }

  // extractLinks(body);

  // console.log(texts);
  // console.log(imageUrls);
  // console.log(links);

  //   console.log(prompt);

  //   const chatCompletion = await openai.createChatCompletion({
  //     model: "gpt-4",
  //     messages: [
  //       {
  //         role: "user",
  //         content: prompt,
  //       },
  //     ],
  //   });

  // console.log(chatCompletion.data.choices[0].message?.content);
})();
