import { Platform } from '@dogu-private/types';
import { DOMParser } from 'xmldom';

import { AndroidNodeUtilizer, AndroidPageSourceParser } from './android';
import { GamiumNodeUtilizer, GamiumPageSourceParser } from './gamium';
import { IosNodeUtilizer, IosPageSourceParser } from './ios';
import {
  AndroidNode,
  AndroidNodeAttributes,
  ContextNode,
  GamiumNode,
  GamiumNodeAttributes,
  GAMIUM_CONTEXT_KEY,
  IosNode,
  IosNodeAttributes,
  NodeAttributes,
  ParsedNode,
} from './types';

function webviewToElement<A>(element: HTMLElement, parentKey: string, index: number): ParsedNode<A> {
  const json: ParsedNode<A> = {
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

export class PageSourceParserFacade {
  public parse(platform: Platform, pageSource: string): GamiumNode | AndroidNode | IosNode {
    const removeSpace = pageSource.replace(/(\r|\n)( ?)+/g, '');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(removeSpace, 'text/xml');
    const root = xmlDoc.documentElement;
    const isGamiumElement = root.attributes.getNamedItem('gamium-version') !== undefined;
    const isWebview = root.tagName === 'html';

    if (isGamiumElement) {
      return new GamiumPageSourceParser(root).parseToNode();
    }

    if (isWebview) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return webviewToElement<any>(root, '', 0);
    }

    switch (platform) {
      case Platform.PLATFORM_ANDROID:
        return new AndroidPageSourceParser(root).parseToNode();
      case Platform.PLATFORM_IOS:
        return new IosPageSourceParser(root).parseToNode();
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}

export class NodeUtilizerFactory {
  static create(platform: Platform, contextAndNode: ContextNode<NodeAttributes>): GamiumNodeUtilizer | AndroidNodeUtilizer | IosNodeUtilizer {
    if (contextAndNode.context === GAMIUM_CONTEXT_KEY) {
      return new GamiumNodeUtilizer(contextAndNode as ContextNode<GamiumNodeAttributes>);
    }

    switch (platform) {
      case Platform.PLATFORM_ANDROID:
        return new AndroidNodeUtilizer(contextAndNode as ContextNode<AndroidNodeAttributes>);
      case Platform.PLATFORM_IOS:
        return new IosNodeUtilizer(contextAndNode as ContextNode<IosNodeAttributes>);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}
