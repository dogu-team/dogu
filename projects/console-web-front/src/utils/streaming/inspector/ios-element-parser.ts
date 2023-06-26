import { plainToInstance } from 'class-transformer';

import { IosInspectorNode, IosNodeAttributes } from '../../../types/inspector';
import { InspectorElementParser } from './index';

class IosElementParser extends InspectorElementParser<IosNodeAttributes> {
  public getXpath: (element: Element) => string = (element) => {
    return '';
  };

  public convertElementToNode: (element: Element, parentNode?: IosInspectorNode) => IosInspectorNode = (element, parentNode) => {
    const json: IosInspectorNode = {
      tag: element.nodeName,
      key: '',
      title: '',
      attributes: {
        index: 1,
      },
    };

    const rawAttributes: { [key in keyof IosNodeAttributes]?: string } = {};

    // Convert element attributes to JSON properties
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      const attrName = attr.name as keyof IosNodeAttributes;
      rawAttributes[attrName] = attr.value;
    }

    json.attributes = plainToInstance(IosNodeAttributes, rawAttributes);

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

  public parse: () => IosInspectorNode = () => {
    const result = this.convertElementToNode(this.rootElement);
    return result;
  };
}

export default IosElementParser;
