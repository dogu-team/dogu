import { plainToInstance } from 'class-transformer';

import { IosInspectorNode, IosNodeAttributes } from '../../../types/inspector';
import { ConvertElementToNodeFunc, GetXPathFunc, InspectorElementParser, ParseFunc } from './index';

class IosElementParser extends InspectorElementParser<IosNodeAttributes> {
  public getXpath: GetXPathFunc = (element, parentPath, index) => {
    const currentPath = `${element.tagName}${index === undefined ? '' : `[${index}]`}`;
    if (parentPath === '/') {
      return `${parentPath}${currentPath}`;
    } else {
      return `${parentPath}/${currentPath}`;
    }
  };

  public convertElementToNode: ConvertElementToNodeFunc<IosNodeAttributes> = (element, parentNode, index) => {
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

  public parse: ParseFunc<IosNodeAttributes> = () => {
    const result = this.convertElementToNode(this.rootElement);
    return result;
  };
}

export default IosElementParser;
