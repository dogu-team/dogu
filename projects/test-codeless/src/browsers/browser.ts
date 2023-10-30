import * as cheerio from 'cheerio';
import { WebDriver } from 'selenium-webdriver';
import { promisify } from 'util';
import { Device } from '../device/devices';

import { ImageTool } from '../image-tools/imageTool';

const wait = promisify(setTimeout);

export abstract class BrowserDriver {
  public readonly device: Device;
  public readonly viewportWidth: number;
  public readonly viewportHeight: number;
  public readonly pixelRatio: number;

  protected driver!: WebDriver;
  protected originalScreeShotsBase64: string[] = [];
  protected hiddenTextScreenshotsBase64: string[] = [];

  abstract build(): Promise<void>;
  abstract takeScreenshot(): Promise<void>;
  abstract hideFixedElements(): Promise<void>;

  constructor(device: Device, viewportWidth: number, viewportHeight: number, pixelRatio: number) {
    this.device = device;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.pixelRatio = pixelRatio;
  }

  async open(url: string): Promise<void> {
    await this.driver.get(url);

    // const cookieString =
    //   'u_at=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmYTlhOThlZC1mZjZiLTQ5NTAtOTFhMy00ZjU3ODc0ODVhZDIiLCJpYXQiOjE2OTgxNTQ3MjYsImV4cCI6MTY5ODE1NTMyNn0.Td9zrT4g3ThMonSi7ltBahhI58sOoa-ZJnt5T9HdHxk; _uid=fa9a98ed-ff6b-4950-91a3-4f5787485ad2; _fw_crm_v=a5caa73a-f068-4e39-d1ba-1052c1bd3a83; first_session=%7B%22visits%22%3A1%2C%22start%22%3A1698154727273%2C%22last_visit%22%3A1698154727273%2C%22url%22%3A%22https%3A%2F%2Fconsole.dev.dogutech.io%2Fko%2Fdashboard%2Feae51b06-54b9-4812-8feb-8693f3ed2e6e%2Flive-testing%22%2C%22path%22%3A%22%2Fko%2Fdashboard%2Feae51b06-54b9-4812-8feb-8693f3ed2e6e%2Flive-testing%22%2C%22referrer%22%3A%22https%3A%2F%2Faccounts.google.com%2F%22%2C%22referrer_info%22%3A%7B%22host%22%3A%22accounts.google.com%22%2C%22path%22%3A%22%2F%22%2C%22protocol%22%3A%22https%3A%22%2C%22port%22%3A80%2C%22search%22%3A%22%22%2C%22query%22%3A%7B%7D%7D%2C%22search%22%3A%7B%22engine%22%3A%22Google%22%2C%22terms%22%3Anull%7D%2C%22version%22%3A0.4%7D';
    // const cookies = cookieString.split(';').map((cookie) => {
    //   let [name, value] = cookie.trim().split('=');
    //   return { name, value };
    // });

    // for (const cookie of cookies) {
    //   await this.driver.manage().addCookie(cookie);
    // }

    // const localStorageData = `{"_fm_rs":"google","_fm_om":"organic search","_fm_oc":"","_fm_s":"","_fm_rm":"organic search","_fm_cam":"","_fm_rc":"","_fm_os":"google","3cbc8f83-27e5-40b6-b44c-1b8a19d54053":"{\\"isUserCreateSent\\":false,\\"isPivacyPolicyShown\\":false,\\"lastActivitySent\\":\\"2023-10-23T15:12:34.657Z\\",\\"wcfcToken\\":\\"g0s736sk3eads2j9qmd4tn8mublvevoam2bk131j\\",\\"wcfcAlias\\":\\"8da9ca9e-b6eb-4f41-83e6-d6795533eb36\\",\\"subDomainName\\":\\"dogutechio\\"}","_fm_jou":"","sidebar-option":"{\\"state\\":{\\"collapsed\\":false},\\"version\\":0}","_fm_m":"","_fm_con":"","test":"test","pageViewCookie":"%7B%22console.dev.dogutech.io%2Fko%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%22%3A%7B%22visitedN%22%3A33%2C%22firstVisited%22%3A1691143076924%2C%22lastVisited%22%3A1695462556856%7D%2C%22count%22%3A30%2C%22console.dev.dogutech.io%2Fko%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%22%3A%7B%22visitedN%22%3A60%2C%22firstVisited%22%3A1691143227628%2C%22lastVisited%22%3A1692588363212%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F437%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1691208465784%2C%22lastVisited%22%3A1691208465784%7D%2C%22console.dev.dogutech.io%2Fko%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fsettings%22%3A%7B%22visitedN%22%3A4%2C%22firstVisited%22%3A1691829241465%2C%22lastVisited%22%3A1691830897331%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fsettings%22%3A%7B%22visitedN%22%3A12%2C%22firstVisited%22%3A1691830705481%2C%22lastVisited%22%3A1691837878987%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%22%3A%7B%22visitedN%22%3A2%2C%22firstVisited%22%3A1691830730836%2C%22lastVisited%22%3A1691830732861%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F543%2Fjobs%2F815%2Fdevice-jobs%2F1032%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1691831215417%2C%22lastVisited%22%3A1691831215417%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F543%2Fjobs%2F815%2Fdevice-jobs%2F1033%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1691831227863%2C%22lastVisited%22%3A1691831227863%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F543%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1691831234629%2C%22lastVisited%22%3A1691831234629%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F545%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1691835285776%2C%22lastVisited%22%3A1691835285776%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F547%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1691837923646%2C%22lastVisited%22%3A1691837923646%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F547%2Fjobs%2F821%2Fdevice-jobs%2F1043%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1691837930820%2C%22lastVisited%22%3A1691837930820%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F547%2Fjobs%2F821%2Fdevice-jobs%2F1042%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1691837939798%2C%22lastVisited%22%3A1691837939798%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F548%2Fjobs%2F823%2Fdevice-jobs%2F1046%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1691838081012%2C%22lastVisited%22%3A1691838081012%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F585%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1692240890285%2C%22lastVisited%22%3A1692240890285%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F584%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1692240897731%2C%22lastVisited%22%3A1692240897731%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F580%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1692240905978%2C%22lastVisited%22%3A1692240905978%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F590%2Fjobs%2F908%2Fdevice-jobs%2F1170%22%3A%7B%22visitedN%22%3A2%2C%22firstVisited%22%3A1692252219890%2C%22lastVisited%22%3A1692252268038%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F635%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1692415439803%2C%22lastVisited%22%3A1692415439803%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F640%2Fdevices%22%3A%7B%22visitedN%22%3A4%2C%22firstVisited%22%3A1692415468538%2C%22lastVisited%22%3A1692415471675%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%22%3A%7B%22visitedN%22%3A6%2C%22firstVisited%22%3A1692417068658%2C%22lastVisited%22%3A1692444697866%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F647%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1692428807959%2C%22lastVisited%22%3A1692428807959%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2F99d9ed6b-80ea-47ba-82ba-086a9c719ba1%2Froutines%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1692431537529%2C%22lastVisited%22%3A1692431537529%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fdevice-farm%2Fhosts%22%3A%7B%22visitedN%22%3A2%2C%22firstVisited%22%3A1692432252409%2C%22lastVisited%22%3A1692432271534%7D%2C%22console.dev.dogutech.io%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Ffb2b1e15-e828-46f1-894a-9e58aa3313dd%2Froutines%2F841%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1693576266439%2C%22lastVisited%22%3A1693576266439%7D%2C%22console.dev.dogutech.io%2Fko%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Fa5fc0e37-c2d5-4a7b-832b-00baa3bc0cce%2Froutines%2F893%2Fjobs%2F1476%2Fdevice-jobs%2F1970%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1694087240183%2C%22lastVisited%22%3A1694087240183%7D%2C%22console.dev.dogutech.io%2Fko%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2Fa5fc0e37-c2d5-4a7b-832b-00baa3bc0cce%2Froutines%2F893%2Fjobs%2F1476%2Fdevice-jobs%2F1969%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1694087286186%2C%22lastVisited%22%3A1694087286186%7D%2C%22console.dev.dogutech.io%2Fko%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2F51c92a26-3180-4dfe-ba82-6054d90abad3%2Froutines%2F1274%2Fdevices%22%3A%7B%22visitedN%22%3A1%2C%22firstVisited%22%3A1695462592753%2C%22lastVisited%22%3A1695462592753%7D%2C%22console.dev.dogutech.io%2Fko%2Fdashboard%2F60d34d27-a7e1-406f-9f06-ca1dcb0f0dac%2Fprojects%2F51c92a26-3180-4dfe-ba82-6054d90abad3%2Froutines%22%3A%7B%22visitedN%22%3A2%2C%22firstVisited%22%3A1695465726981%2C%22lastVisited%22%3A1695465807639%7D%2C%22console.dev.dogutech.io%2Fko%2Fdashboard%2Feae51b06-54b9-4812-8feb-8693f3ed2e6e%2Flive-testing%22%3A%7B%22visitedN%22%3A35%2C%22firstVisited%22%3A1697796531957%2C%22lastVisited%22%3A1698154727271%7D%7D","streaming-option":"{\\"state\\":{\\"option\\":{\\"fps\\":60,\\"resolution\\":720,\\"scrollSensitivity\\":25}},\\"version\\":0}"}`;
    // const parsedLocalStorage = JSON.parse(localStorageData);

    // for (const key in parsedLocalStorage) {
    //   try {
    //     await this.driver.executeScript(`window.localStorage.setItem("${key}", "${parsedLocalStorage[key]}");`);
    //   } catch (error) {
    //     console.log(key);
    //   }
    // }

    // await this.driver.navigate().refresh();

    await wait(1000);
  }

  async render(): Promise<void> {
    await wait(1000);
    await this.driver.executeScript('window.scrollBy(0,document.body.scrollHeight)');
    await wait(2000);
    await this.driver.executeScript('window.scrollTo(0, 0);', '');
    await wait(1000);
  }

  async mergeVertically(): Promise<void> {
    const display = `${this.device.screen.viewportWidth}x${this.device.screen.viewportHeight}`;

    await Promise.all([
      ImageTool.mergeVertically(this.originalScreeShotsBase64, display),
      // ImageTool.mergeVertically(this.hiddenTextScreenshotsBase64, `${this.driverName}_hidden_text`),
    ]);
  }

  async close(): Promise<void> {
    await this.driver.quit();
  }

  protected createUserAgent(): string {
    switch (this.device.vendor) {
      case 'Samsung':
        return `Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/604.1`;
      case 'Apple':
        return `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/118.0.0.0 Mobile/15E148 Safari/604.1`;
      default:
        return `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/604.1`;
    }
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
