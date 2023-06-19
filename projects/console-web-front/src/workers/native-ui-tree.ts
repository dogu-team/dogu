import { Platform } from '@dogu-private/types';
import { plainToInstance, Transform, Type } from 'class-transformer';
import 'reflect-metadata';
import { DOMParser } from 'xmldom';
import { ContextAndNode, InspectorWorkerMessage } from '../hooks/streaming/useInspector';

export type InspectorWorkerResponse = Pick<ContextAndNode, 'context' | 'node'>;

class ScreenPosition {
  start!: [number, number];
  end!: [number, number];
}

export enum AppiumRotation {
  PORTRAIT = 0,
  LANDSCAPE_LEFT = 1,
  PORTRAIT_UPSIDE_DOWN = 2,
  LANDSCAPE_RIGHT = 3,
}

export enum DeviceRotationDirection {
  TOP_DOWN,
  LEFT,
  UPSIDE_DOWN,
  RIGHT,
}

export class InspectNodeAttributes {
  @Type(() => Number)
  rotation?: AppiumRotation;

  @Type(() => Number)
  height?: number;

  @Type(() => Number)
  width?: number;

  @Type(() => Number)
  index?: number;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  checkable?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  checked?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  clickable?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  enabled?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  focusable?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  focused?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  'long-clickable'?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  scrollable?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  selected?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  displayed?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  password?: string;

  @Type(() => ScreenPosition)
  @Transform(({ value }) => {
    const regex = /\[(\d+),(\d+)\]\[(\d+),(\d+)\]/;
    const matches = value.match(regex);
    if (matches) {
      const [, startX, startY, endX, endY] = matches;
      return { start: [Number(startX), Number(startY)], end: [Number(endX), Number(endY)] };
    }
  })
  bounds?: ScreenPosition;

  name?: string;
  package?: string;
  class?: string;
  text?: string;
  'resource-id'?: string;
  'content-desc'?: string;
}

type AttributeFields = keyof InspectNodeAttributes;

export class GameObjectScreenPosition {
  x!: number;
  y!: number;
}

export class GameObjectScreenRectSize {
  width!: number;
  height!: number;
}

export class GameObjectPosition {
  x!: number;
  y!: number;
  z!: number;
}

export class GameObjectRotation {
  x!: number;
  y!: number;
  z!: number;
  w!: number;
}

export class GamiumAttributes {
  @Type(() => Number)
  index?: number;

  @Type(() => GameObjectScreenPosition)
  @Transform(({ value }) => {
    const regex = /-?\d+(\.\d+)?/g;
    const matches = value.match(regex);
    if (matches) {
      const [x, y] = matches;
      return { x: Number(x), y: Number(y) };
    }
  })
  ['screen-position']?: GameObjectScreenPosition;

  @Type(() => GameObjectScreenRectSize)
  @Transform(({ value }) => {
    const regex = /-?\d+(\.\d+)?/g;
    const matches = value.match(regex);
    if (matches) {
      const [width, height] = matches;
      return { width: Number(width), height: Number(height) };
    }
  })
  ['screen-rect-size']?: GameObjectScreenRectSize;

  @Type(() => GameObjectPosition)
  @Transform(({ value }) => {
    const regex = /-?\d+(\.\d+)?/g;
    const matches = value.match(regex);
    if (matches) {
      const [x, y, z] = matches;
      return { x: Number(x), y: Number(y), z: Number(z) };
    }
  })
  position?: GameObjectPosition;

  @Type(() => GameObjectRotation)
  @Transform(({ value }) => {
    const regex = /-?\d+(\.\d+)?/g;
    const matches = value.match(regex);
    if (matches) {
      const [x, y, z, w] = matches;
      return { x: Number(x), y: Number(y), z: Number(z), w: Number(w) };
    }
  })
  rotation?: GameObjectRotation;

  name?: string;
  path?: string;
  text?: string;
  orientation?: string;
}

type GamiumAttributeFields = keyof GamiumAttributes;

// convert xml like string to json

export interface InspectNode {
  tag: string;
  attributes: InspectNodeAttributes;
  key: string;
  title: string;
  children?: InspectNode[];
}

function elementToObject(element: HTMLElement, parentKey: string, elementKey: keyof HTMLElement): InspectNode {
  const json: InspectNode = {
    tag: element.nodeName,
    key: '',
    title: '',
    attributes: {},
  };

  const rawAttributes: { [key in AttributeFields]?: string } = {};

  // Convert element attributes to JSON properties
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    const attrName = attr.name as AttributeFields;
    rawAttributes[attrName] = attr.value;
  }

  json.attributes = plainToInstance(InspectNodeAttributes, rawAttributes);

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

      json.children.push(elementToObject(child as HTMLElement, key, elementKey));
    }
  }

  return json;
}

function webviewToElement(element: HTMLElement, parentKey: string, index: number) {
  const json: InspectNode = {
    tag: element.nodeName,
    key: '',
    title: '',
    attributes: {},
  };

  const rawAttributes: { [key in AttributeFields]?: string } = {};

  // Convert element attributes to JSON properties
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    const attrName = attr.name as AttributeFields;
    rawAttributes[attrName] = attr.value;
  }

  json.attributes = plainToInstance(InspectNodeAttributes, rawAttributes);

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

const gameElementToObject = (element: HTMLElement, parentKey: string, parentPath: string): InspectNode => {
  const json: InspectNode = {
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

  json.attributes = plainToInstance(GamiumAttributes, rawAttributes) as any;

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
  (json.attributes as GamiumAttributes).path = path;
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
    const convertedResult: InspectorWorkerResponse[] = [];

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
          const json = webviewToElement(root, '', 0);
          convertedResult.push({ context, node: json });
        } else {
          switch (platform) {
            case Platform.PLATFORM_ANDROID:
              const androidResult = elementToObject(root, '', 'tagName');
              convertedResult.push({ context, node: androidResult });
              break;
            case Platform.PLATFORM_IOS:
              const iosResult = elementToObject(root, '', 'tagName');
              convertedResult.push({ context, node: iosResult });
              break;
          }
        }
      }
    }

    self.postMessage(convertedResult);
  }
};

export {};
