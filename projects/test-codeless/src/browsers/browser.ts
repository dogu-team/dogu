import * as cheerio from 'cheerio';
import { WebDriver } from 'selenium-webdriver';
import { promisify } from 'util';

import { ImageTool } from '../image-tools/imageTool';

const wait = promisify(setTimeout);

export abstract class BrowserDriver {
  public readonly driverName: string;
  public readonly widthResolution: number;
  public readonly heightResolution: number;
  public readonly pixelRatio: number;

  protected driver!: WebDriver;
  protected originalScreeShotsBase64: string[] = [];
  protected hiddenTextScreenshotsBase64: string[] = [];

  abstract build(): Promise<void>;
  abstract takeScreenshot(): Promise<void>;
  abstract hideFixedElements(): Promise<void>;

  constructor(driverName: string, widthSize: number, heightSize: number, pixelRatio: number) {
    this.driverName = driverName;
    this.widthResolution = widthSize;
    this.heightResolution = heightSize;
    this.pixelRatio = pixelRatio;
  }

  async open(url: string): Promise<void> {
    await this.driver.get(url);
    await wait(1000);
  }

  async render(): Promise<void> {
    // await this.driver.manage().window().minimize();
    // await wait(1000);
    // await this.driver.manage().window().maximize();

    await wait(1000);
    await this.driver.executeScript('window.scrollBy(0,document.body.scrollHeight)');
    await wait(2000);
    await this.driver.executeScript('window.scrollTo(0, 0);', '');
    await wait(1000);
  }

  async mergeVertically(): Promise<void> {
    await Promise.all([
      ImageTool.mergeVertically(this.originalScreeShotsBase64, this.driverName),
      // ImageTool.mergeVertically(this.hiddenTextScreenshotsBase64, `${this.driverName}_hidden_text`),
    ]);
  }

  async close(): Promise<void> {
    await this.driver.quit();
  }

  protected createXPath(element: cheerio.Element) {
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
      let siblings = currentElement.parent.children.filter((child: { type: string }) => child.type === 'tag');
      //@ts-ignore
      let tagName = currentElement.tagName;
      //@ts-ignore
      let sameTagSiblings = siblings.filter((child: { tagName: any }) => child.tagName === tagName);
      let tagIndex = sameTagSiblings.indexOf(currentElement) + 1;
      xpath = '/' + tagName + '[' + tagIndex + ']' + xpath;
      //@ts-ignore
      currentElement = currentElement.parent;
    }

    return '/' + xpath;
  }

  protected async hideText(node: cheerio.Element, opacity: number) {
    //@ts-ignore
    if (node.type === 'text') {
      //@ts-ignore
      const textNode = node as cheerio.TextElement;
      if (textNode.data) {
        const text = textNode.data.trim();
        if (text.length !== 0) {
          const xpath = this.createXPath(node);
          await this.driver.executeScript(
            `
            const element = document.evaluate('${xpath}', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if(element && element.style) {
              element.style.opacity = ${opacity};
            }
            `,
          );
        }
      }
    } else if (node.type === 'tag') {
      if (node.children) {
        for (const child of node.children) {
          //@ts-ignore
          await this.hideText(child, opacity);
        }
      }

      //@ts-ignore
      const element = node as cheerio.TagElement;
      switch (element.name) {
        case 'video':
          const xpath = this.createXPath(node);
          await this.driver.executeScript(
            `
            const element = document.evaluate('${xpath}', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if(element && element.style) {
              element.style.opacity = ${opacity};
            }
            `,
          );
      }
    }
  }
}
