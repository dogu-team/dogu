/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

import { Device } from '@dogu-private/device-data';
import * as cheerio from 'cheerio';
import { WebDriver } from 'selenium-webdriver';
import { promisify } from 'util';

import { Sharp } from 'sharp';
import { ImageTool } from '../image-tools/imageTool';

const wait = promisify(setTimeout);

export abstract class BrowserDriver {
  public readonly device: Device;
  public isClosed = false;

  protected driver!: WebDriver;
  protected originalScreenShotsBase64: string[] = [];
  protected hiddenTextScreenshotsBase64: string[] = [];

  abstract build(): Promise<void>;
  abstract takeScreenshot(): Promise<void>;
  abstract hideFixedElements(): Promise<void>;
  abstract render(): Promise<void>;

  constructor(device: Device) {
    this.device = device;
  }

  async open(url: string): Promise<void> {
    await this.driver.get(url);
    await wait(1000);
  }

  async mergeVertically(): Promise<Sharp> {
    const image = await ImageTool.mergeVertically(this.originalScreenShotsBase64);
    return image;
  }

  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.quit();
      this.isClosed = true;
    }
  }

  protected createUserAgent(): string {
    switch (this.device.vendor) {
      case 'Samsung':
        return `Mozilla/5.0 (Linux; Android 13) AppleWebKit/604.1 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/604.1`;
      case 'Apple':
        return `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/119.0.0.0 Mobile/15E148 Safari/604.1`;
      default:
        return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/604.1 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/604.1`;
    }
  }

  protected createXPath(node: cheerio.ParentNode | cheerio.Node): string {
    const currentElement = node as cheerio.Element;
    let xpath = '';
    let currentNode = node;

    if (currentElement.name === undefined) {
      currentNode = node.parent!;
    }

    while (currentElement && currentNode.type !== 'root') {
      const siblings = currentNode.parent!.children.filter((child: { type: string }) => child.type === 'tag');
      const tagName = currentElement.tagName;
      const sameTagSiblings = siblings.filter((childNode: cheerio.Node) => {
        const element = childNode as cheerio.Element;
        return element.tagName === tagName;
      });
      const tagIndex = sameTagSiblings.indexOf(currentElement) + 1;

      xpath = '/' + tagName + '[' + tagIndex + ']' + xpath;
      currentNode = currentNode.parent!;
    }

    return '/' + xpath;
  }

  protected async setElementOpacity(node: cheerio.ParentNode | cheerio.Node, opacity: number): Promise<void> {
    const element = node as cheerio.Element;

    if (node.type === 'tag') {
      if (element.children) {
        for (const child of element.children) {
          await this.setElementOpacity(child, opacity);
        }
      }

      console.log(element.name);
      switch (element.name) {
        case 'video':
        case 'img':
          const xpath = this.createXPath(node as cheerio.Node);
          await this.driver.executeScript(
            `
            const element = document.evaluate('${xpath}', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if(element && element.style) {
              element.style.opacity = ${opacity};
            }
            `,
          );
      }
    } else if (node.type === 'text') {
      const textElement = node as cheerio.Element;
      //@ts-ignore
      const textData: string | undefined = textElement.data;

      if (textData) {
        const text = textData.trim();

        if (text.length !== 0) {
          const xpath = this.createXPath(node as cheerio.Node);
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
}
