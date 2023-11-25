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
  abstract getUITexts(): Promise<{ xpath: string; text: string }[]>;
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
    let currentNode = node as cheerio.Node;

    if (currentElement.name === undefined) {
      currentNode = node.parent!;
    }

    while (currentElement && currentNode.type !== 'root') {
      const siblings = currentNode.parent!.children.filter((child: { type: string }) => child.type === 'tag');
      //@ts-ignore
      const tagName = currentNode.name;
      const sameTagSiblings = siblings.filter((childNode: cheerio.Node) => {
        const element = childNode as cheerio.Element;
        return element.tagName === tagName;
      });
      //@ts-ignore
      const tagIndex = sameTagSiblings.indexOf(currentNode) + 1;

      xpath = '/' + tagName + '[' + tagIndex + ']' + xpath;
      currentNode = currentNode.parent!;
    }

    return '/' + xpath;
  }

  protected async getElementTexts(node: cheerio.ParentNode | cheerio.Node, texts: { xpath: string; text: string }[] = []): Promise<{ xpath: string; text: string }[]> {
    const element = node as cheerio.Element;

    if (node.type === 'tag') {
      if (element.children) {
        for (const child of element.children) {
          await this.getElementTexts(child, texts);
        }
      }

      const placeholder = element.attribs.placeholder;
      if (placeholder) {
        const xpath = this.createXPath(node as cheerio.Node);
        texts.push({
          xpath,
          text: placeholder,
        });
      }
    } else if (node.type === 'text') {
      const textElement = node as cheerio.Element;
      //@ts-ignore
      const textData: string | undefined = textElement.data;

      if (textData) {
        const text = textData.trim();

        if (text.length !== 0) {
          const xpath = this.createXPath(node as cheerio.Node);

          const isVisibleElement = await this.driver.executeScript(`
            const element = document.evaluate('${xpath}', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if(element) {
              const rect = element.getBoundingClientRect();
              const width = rect.width;
              const height = rect.height;
              const x = rect.x;
              const y = rect.y;

              const style = window.getComputedStyle(element);
              const display = style.display;
              const visibility = style.visibility;
              const opacity = style.opacity;

              if(width !== 0 && height !== 0 && x !== 0 && y !== 0 && display !== 'none' && visibility !== 'hidden' && opacity !== '0') {
                return true;
              }
            }

            return false;
          `);

          if (isVisibleElement && text.length !== 1 && text.length <= 20) {
            texts.push({
              xpath,
              text,
            });
          }
        }
      }
    }

    return texts;
  }

  protected async setElementOpacity(node: cheerio.ParentNode | cheerio.Node, opacity: number): Promise<void> {
    const element = node as cheerio.Element;

    if (node.type === 'tag') {
      if (element.children) {
        for (const child of element.children) {
          await this.setElementOpacity(child, opacity);
        }
      }

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

          const isVisibleElement = await this.driver.executeScript(`
            const element = document.evaluate('${xpath}', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if(element) {
              const rect = element.getBoundingClientRect();
              const width = rect.width;
              const height = rect.height;
              const x = rect.x;
              const y = rect.y;

              if(width !== 0 && height !== 0 && x !== 0 && y !== 0) {
                return true;
              }

              // const width = element.clientWidth;
              // const height = element.clientHeight;
              // const style = window.getComputedStyle(element);
              // const display = style.display;
              // const visibility = style.visibility;
              // const opacity = style.opacity;

              // if(width !== 0 && height !== 0 && display !== 'none' && visibility !== 'hidden' && opacity !== '0') {
              //   return true;
              // }
            }

            return false;
          `);

          if (isVisibleElement) {
            console.log(`${xpath}: ${text}`);
          }
        }
      }
    }
  }
}
