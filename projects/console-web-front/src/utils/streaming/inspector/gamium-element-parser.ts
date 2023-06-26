import { plainToInstance } from 'class-transformer';

import { GamiumAttributeFields, GamiumInspectorNode, GamiumNodeAttributes } from '../../../types/inspector';
import { InspectorElementParser } from './index';

class GamiumElementParser extends InspectorElementParser<GamiumNodeAttributes> {
  public getXpath: (element: Element) => string = (element) => {
    return '';
  };

  public convertElementToNode: (element: Element, parentNode?: GamiumInspectorNode) => GamiumInspectorNode = (element, parentNode) => {
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

    let key = parentNode?.key || '';
    let path = parentNode?.attributes.path || '';
    if (element.tagName !== 'hierarchy') {
      const currentKey = `${name || element['tagName']}[${rawAttributes.index}]`;

      if (key === '/') {
        key = `${key}${currentKey}`;
      } else {
        key = `${key}/${currentKey}`;
      }

      // gamium xpath rule. scenes are root
      let currentPath = `${name || element['tagName']}[${rawAttributes.index}]`;
      if ((element.parentNode as HTMLElement).tagName === 'hierarchy') {
        path = '/';
      } else {
        if (path === '/') {
          path = `${path}${currentPath}`;
        } else {
          path = `${path}/${currentPath}`;
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

        json.children.push(this.convertElementToNode(child as HTMLElement, json));
      }
    }

    return json;
  };

  public parse: () => GamiumInspectorNode = () => {
    const result = this.convertElementToNode(this.rootElement);
    return result;
  };
}

export default GamiumElementParser;
