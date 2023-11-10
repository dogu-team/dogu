/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */

import * as cheerio from 'cheerio';
import lodash from 'lodash';
import { Configuration, OpenAIApi } from 'openai';
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

  const url = 'https://www.thehyundai.com/front/cob/loginForm.thd';
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
      //@ts-ignore
      currentElement = element.parent;
    }

    //@ts-ignore
    while (currentElement && currentElement.type !== 'root') {
      //@ts-ignore
      const siblings = currentElement.parent.children.filter((child) => child.type === 'tag');
      //@ts-ignore
      const tagName = currentElement.tagName;
      //@ts-ignore
      const sameTagSiblings = siblings.filter((child) => child.tagName === tagName);
      const tagIndex = sameTagSiblings.indexOf(currentElement) + 1;
      xpath = '/' + tagName + '[' + tagIndex + ']' + xpath;
      //@ts-ignore
      currentElement = currentElement.parent;
    }

    return '/' + xpath;
  }

  async function extractText(node: cheerio.Element) {
    //@ts-ignore
    if (node.type === 'text') {
      //@ts-ignore
      const textNode = node as cheerio.TextElement;

      //@ts-ignore
      if (textNode.data) {
        //@ts-ignore
        const text = textNode.data.trim();

        //@ts-ignore
        if (text.length !== 0) {
          const xpath = createXPath(node);

          //@ts-ignore
          const boundingRect: Object = await driver.executeScript(
            `return document.evaluate('${xpath}', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.getBoundingClientRect()`,
            '',
          );

          //@ts-ignore
          if (boundingRect['width'] === 0 || boundingRect['height'] === 0) {
            return;
          }

          //@ts-ignore
          const textObj = lodash.merge(boundingRect, { text: text });
          //@ts-ignore
          texts.push(textObj);
        }
      }
      //@ts-ignore
    } else if (node.type === 'tag' && node.name !== 'script' && node.children) {
      for (const child of node.children) {
        //@ts-ignore
        await extractText(child);
      }
    }
  }

  await extractText(body);

  for (const text of texts) {
    if (text.width === 0 || text.height === 0 || text.x === 0 || text.y === 0) {
      continue;
    }

    console.log(text.text);
  }

  // const chatCompletion = await openai.createChatCompletion({
  //   model: 'gpt-3.5-turbo',
  //   messages: [
  //     {
  //       role: 'user',
  //       content: prompt,
  //     },
  //   ],
  // });

  // console.log(chatCompletion.data.choices[0].message?.content);

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
