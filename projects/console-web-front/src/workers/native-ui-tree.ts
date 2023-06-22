import { Platform } from '@dogu-private/types';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import 'reflect-metadata';
import { DOMParser } from 'xmldom';
import {
  AndroidNodeAttributes,
  GamiumAttributeFields,
  GamiumInspectorNode,
  GamiumNodeAttributes,
  InspectNode,
  InspectorWorkerMessage,
  InspectorWorkerResponse,
} from '../types/inspector';

function elementToObject<A extends { index: number }>(element: HTMLElement, parentKey: string, elementKey: keyof HTMLElement, attributeClass: ClassConstructor<A>): InspectNode<A> {
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

  json.attributes = plainToInstance(attributeClass, rawAttributes);

  let key = parentKey;
  if (element.tagName !== 'hierarchy') {
    const currentPath = `${element[elementKey]}[${rawAttributes.index}]`;
    if (parentKey === '/') {
      key = `${parentKey}${currentPath}`;
    } else {
      key = `${parentKey}/${currentPath}`;
    }
  } else {
    key = '/';
  }
  json.key = key;
  json.title = `${element[elementKey]}` || 'No title';

  // Convert child elements recursively
  if (element.childNodes.length > 0) {
    json.children = [];
    for (let i = 0; i < element.childNodes.length; i++) {
      const child = element.childNodes[i];

      // Ignore empty text nodes
      if (child.nodeValue) {
        continue;
      }

      json.children.push(elementToObject(child as HTMLElement, key, elementKey, attributeClass));
    }
  }

  return json;
}

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

const gameElementToObject = (element: HTMLElement, parentKey: string, parentPath: string): GamiumInspectorNode => {
  const json: GamiumInspectorNode = {
    tag: element.nodeName,
    key: '',
    title: '',
    attributes: {},
  };

  const rawAttributes: { [key in GamiumAttributeFields]?: string } = {};

  // Convert element attributes to JSON properties
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    const attrName = attr.name as GamiumAttributeFields;
    rawAttributes[attrName] = attr.value;
  }

  json.attributes = plainToInstance(GamiumNodeAttributes, rawAttributes) as any;

  const name = json.attributes['name'];

  let key = parentKey;
  let path = parentPath;
  if (element.tagName !== 'hierarchy') {
    const currentKey = `${name || element['tagName']}[${rawAttributes.index}]`;

    if (parentKey === '/') {
      key = `${parentKey}${currentKey}`;
    } else {
      key = `${parentKey}/${currentKey}`;
    }

    // gamium xpath rule. scenes are root
    let currentPath = `${name || element['tagName']}[${rawAttributes.index}]`;
    if ((element.parentNode as HTMLElement).tagName === 'hierarchy') {
      path = '/';
    } else {
      if (parentPath === '/') {
        path = `${parentPath}${currentPath}`;
      } else {
        path = `${parentPath}/${currentPath}`;
      }
    }
  } else {
    key = '/';
    path = '';
  }

  json.key = key;
  json.attributes.path = path;
  json.title = `${name || element['tagName']}` || 'No title';

  // Convert child elements recursively
  if (element.childNodes.length > 0) {
    json.children = [];
    for (let i = 0; i < element.childNodes.length; i++) {
      const child = element.childNodes[i];

      // Ignore empty text nodes
      if (child.nodeValue) {
        continue;
      }

      json.children.push(gameElementToObject(child as HTMLElement, key, path));
    }
  }

  return json;
};

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
        const json = gameElementToObject(root, '', '');
        convertedResult.push({ context, node: json });
      } else {
        const isWebview = root.tagName === 'html';

        if (isWebview) {
          const json = webviewToElement<any>(root, '', 0);
          convertedResult.push({ context, node: json });
        } else {
          switch (platform) {
            case Platform.PLATFORM_ANDROID:
              const androidResult = elementToObject(root, '', 'tagName', AndroidNodeAttributes);
              convertedResult.push({ context, node: androidResult });
              break;
            // case Platform.PLATFORM_IOS:
            //   const iosResult = elementToObject(root, '', 'tagName');
            //   convertedResult.push({ context, node: iosResult });
            //   break;
          }
        }
      }
    }

    self.postMessage(convertedResult);
  }
};

export {};
