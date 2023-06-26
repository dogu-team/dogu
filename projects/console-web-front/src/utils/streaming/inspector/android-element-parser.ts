import { plainToInstance } from 'class-transformer';

import { AndroidInspectorNode, AndroidNodeAttributes } from '../../../types/inspector';
import { InspectorElementParser, ParseFunc } from './index';

class AndroidElementParser extends InspectorElementParser<AndroidNodeAttributes> {
  public getXpath: (element: Element, parentPath: string, index?: number) => string = (element, parentPath, index) => {
    return '';
  };

  public convertElementToNode: (element: Element, parentNode?: AndroidInspectorNode) => AndroidInspectorNode = (element, parentNode) => {
    const json: AndroidInspectorNode = {
      tag: element.nodeName,
      key: '',
      title: '',
      attributes: {
        index: 1,
      },
    };

    const rawAttributes: { [key in keyof AndroidNodeAttributes]?: string } = {};

    // Convert element attributes to JSON properties
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      const attrName = attr.name as keyof AndroidNodeAttributes;
      rawAttributes[attrName] = attr.value;
    }

    json.attributes = plainToInstance(AndroidNodeAttributes, rawAttributes);

    let key = parentNode?.key || '';
    if (element.tagName !== 'hierarchy') {
      const currentPath = `${element.tagName}[${rawAttributes.index}]`;
      if (key === '/') {
        key = `${key}${currentPath}`;
      } else {
        key = `${key}/${currentPath}`;
      }
    } else {
      key = '/';
    }
    json.key = key;
    json.title = `${element.tagName}` || 'No title';

    // Convert child elements recursively
    if (element.childNodes.length > 0) {
      json.children = [];
      for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];

        // Ignore empty text nodes
        if (child.nodeValue) {
          continue;
        }

        json.children.push(this.convertElementToNode(child as HTMLElement, json));
      }
    }

    return json;
  };

  public parse: ParseFunc<AndroidNodeAttributes> = () => {
    const result = this.convertElementToNode(this.rootElement);
    return result;
  };
}

export default AndroidElementParser;
