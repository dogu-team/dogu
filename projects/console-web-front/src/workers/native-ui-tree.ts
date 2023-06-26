import { Platform } from '@dogu-private/types';
import 'reflect-metadata';
import { DOMParser } from 'xmldom';

import { AndroidNodeAttributes, GamiumNodeAttributes, InspectNode, InspectorWorkerMessage, InspectorWorkerResponse } from '../types/inspector';
import AndroidElementParser from '../utils/streaming/inspector/android-element-parser';
import GamiumElementParser from '../utils/streaming/inspector/gamium-element-parser';
import IosElementParser from '../utils/streaming/inspector/ios-element-parser';

function webviewToElement<A>(element: HTMLElement, parentKey: string, index: number) {
  const json: InspectNode<A> = {
    tag: element.nodeName,
    key: '',
    title: '',
    attributes: {} as A,
  };

  const rawAttributes: { [key in keyof A]?: string } = {};

  // Convert element attributes to JSON properties
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    const attrName = attr.name as keyof A;
    rawAttributes[attrName] = attr.value;
  }

  // json.attributes = plainToInstance({}, rawAttributes);
  json.attributes = rawAttributes as A;

  let key = parentKey;
  if (element.tagName !== 'hierarchy') {
    const currentPath = `${element.tagName}[${index}]`;
    if (parentKey === '/') {
      key = `${parentKey}${currentPath}`;
    } else {
      key = `${parentKey}/${currentPath}`;
    }
  } else {
    key = '/';
  }
  json.key = key;
  json.title = element.tagName;

  // Convert child elements recursively
  if (element.childNodes.length > 0) {
    json.children = [];
    for (let i = 0; i < element.childNodes.length; i++) {
      const child = element.childNodes[i];

      // Ignore empty text nodes
      if (child.nodeValue) {
        continue;
      }

      json.children.push(webviewToElement(child as HTMLElement, key, i));
    }
  }

  return json;
}

globalThis.onmessage = (e: MessageEvent<InspectorWorkerMessage>) => {
  const { type, result, platform } = e.data;

  if (type === 'convert') {
    const parser = new DOMParser();
    const convertedResult: InspectorWorkerResponse<AndroidNodeAttributes | GamiumNodeAttributes>[] = [];

    for (const r of result) {
      const { context, pageSource } = r;
      const removeSpace = pageSource.replace(/(\r|\n)( ?)+/g, '');
      const xmlDoc = parser.parseFromString(removeSpace, 'text/xml');
      const root = xmlDoc.documentElement;
      const isGamiumElement = root.attributes.getNamedItem('gamium-version') !== undefined;

      if (isGamiumElement) {
        const gamiumParser = new GamiumElementParser(root);
        const node = gamiumParser.parse();
        convertedResult.push({ context, node });
      } else {
        const isWebview = root.tagName === 'html';

        if (isWebview) {
          const json = webviewToElement<any>(root, '', 0);
          convertedResult.push({ context, node: json });
        } else {
          switch (platform) {
            case Platform.PLATFORM_ANDROID:
              const androidParser = new AndroidElementParser(root);
              const androidNode = androidParser.parse();
              convertedResult.push({ context, node: androidNode });
              break;
            case Platform.PLATFORM_IOS:
              const iosParser = new IosElementParser(root);
              const iosNode = iosParser.parse();
              convertedResult.push({ context, node: iosNode });
              break;
          }
        }
      }
    }

    self.postMessage(convertedResult);
  }
};

export {};
