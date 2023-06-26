import { plainToInstance } from 'class-transformer';

import { AndroidInspectorNode, AndroidNodeAttributes } from '../../../types/inspector';
import { ConvertElementToNodeFunc, GetXPathFunc, InspectorElementParser, ParseFunc } from './index';

class AndroidElementParser extends InspectorElementParser<AndroidNodeAttributes> {
  public getXpath: GetXPathFunc = (element, parentPath, index) => {
    const currentPath = `${element.tagName}${index === undefined ? '' : `[${index}]`}`;
    if (parentPath === '/') {
      return `${parentPath}${currentPath}`;
    } else {
      return `${parentPath}/${currentPath}`;
    }
  };

  public convertElementToNode: ConvertElementToNodeFunc<AndroidNodeAttributes> = (element, parentNode, index) => {
    const json: AndroidInspectorNode = {
      tag: element.nodeName,
      key: '',
      title: '',
      attributes: {
        index: 1,
        path: '',
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

    const path = this.getXpath(element, parentNode?.key || '/', index);
    json.key = path;
    json.attributes.path = path;
    json.title = `${element.tagName}` || 'No title';

    const childIndexes = this.getChildIndexes(element);

    // Convert child elements recursively
    if (element.childNodes.length > 0) {
      json.children = [];
      for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];

        // Ignore empty text nodes
        if (child.nodeValue) {
          continue;
        }

        json.children.push(this.convertElementToNode(child as HTMLElement, json, childIndexes[i]));
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
