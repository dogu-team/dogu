import { plainToInstance } from 'class-transformer';

import {
  ConvertElementToNodeFunc,
  DeviceRotationDirection,
  GamiumNode,
  GamiumNodeAttributeFields,
  GamiumNodeAttributes,
  GamiumRotation,
  GetDeviceRotationFunc,
  GetDeviceScreenSizeFunc,
  GetInspectingAreaFunc,
  GetNodeBoundFunc,
  NodeUtilizer,
  PageSourceParser,
  ParsedNode,
  ParseToNodeFunc,
} from './types';

export class GamiumPageSourceParser extends PageSourceParser<GamiumNodeAttributes> {
  public convertElementToNode: ConvertElementToNodeFunc<GamiumNodeAttributes> = (element, parentNode) => {
    const json: GamiumNode = {
      tag: element.nodeName,
      key: '',
      title: '',
      attributes: {
        index: 1,
      },
    };

    const rawAttributes: { [key in GamiumNodeAttributeFields]?: GamiumNodeAttributes[key] } = {};

    // Convert element attributes to JSON properties
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      const attrName = attr.name as GamiumNodeAttributeFields;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      rawAttributes[attrName] = attr.value;
    }

    json.attributes = plainToInstance(GamiumNodeAttributes, rawAttributes);

    const name = json.attributes['name'];

    let key = parentNode?.key || '';
    let path = parentNode?.attributes.path || '';
    if (element.tagName !== 'hierarchy') {
      const currentKey = `${name || element['tagName']}[${rawAttributes.index ?? 1}]`;

      if (key === '/') {
        key = `${key}${currentKey}`;
      } else {
        key = `${key}/${currentKey}`;
      }

      // gamium xpath rule. scenes are root
      const currentPath = `${name || element['tagName']}[${rawAttributes.index ?? 1}]`;
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

  public parseToNode: ParseToNodeFunc<GamiumNodeAttributes> = () => {
    const result = this.convertElementToNode(this.rootElement);
    return result;
  };
}

export class GamiumNodeUtilizer extends NodeUtilizer<GamiumNodeAttributes> {
  public getNodeBound: GetNodeBoundFunc<GamiumNodeAttributes> = (node) => {
    const screenPosition = node.attributes['screen-position'];
    const screenRectSize = node.attributes['screen-rect-size'];
    const deviceScreenSize = this.getDeviceScreenSize();

    if (!screenPosition) {
      return {
        x: 0,
        y: 0,
        width: screenRectSize?.width || 0,
        height: screenRectSize?.height || 0,
      };
    }

    if (!screenRectSize) {
      return {
        x: screenPosition.x,
        y: screenPosition.y,
        width: 0,
        height: 0,
      };
    }

    /*
     * screenPosition is cetner of screenRectSize
     * screenPosition is start (0,0) from bottom left of screen
     * need to convert to start (0,0) from top left of screen
     */
    return {
      x: screenPosition.x - screenRectSize.width / 2,
      y: deviceScreenSize.height - screenPosition.y - screenRectSize.height / 2,
      width: screenRectSize.width,
      height: screenRectSize.height,
    };
  };

  public getNodesByPosition: (x: number, y: number) => ParsedNode<GamiumNodeAttributes>[] = (x, y) => {
    throw new Error('Method not implemented.');
    return [];
  };

  public getFocusedNode: () => ParsedNode<GamiumNodeAttributes> | null = () => {
    throw new Error('Method not implemented.');
    return null;
  };

  public getInspectingArea: GetInspectingAreaFunc = () => {
    const deviceSize = this.getDeviceScreenSize();

    return {
      x: 0,
      y: 0,
      ...deviceSize,
    };
  };

  public getDeviceRotation: GetDeviceRotationFunc = () => {
    const orientation = this.contextAndNode.node.attributes.orientation;

    switch (orientation) {
      case GamiumRotation.PORTRAIT:
        return DeviceRotationDirection.TOP_DOWN;
      case GamiumRotation.LANDSCAPE_LEFT:
        return DeviceRotationDirection.LEFT;
      case GamiumRotation.LANDSCAPE_RIGHT:
        return DeviceRotationDirection.RIGHT;
      case GamiumRotation.PORTRAIT_UPSIDE_DOWN:
        return DeviceRotationDirection.UPSIDE_DOWN;
      case GamiumRotation.AUTO_ROTATION:
      default:
        return DeviceRotationDirection.TOP_DOWN;
    }
  };

  public getDeviceScreenSize: GetDeviceScreenSizeFunc = () => {
    const width = this.contextAndNode.node.attributes.width;
    const height = this.contextAndNode.node.attributes.height;

    return {
      width: width || this.contextAndNode.screenSize.width,
      height: height || this.contextAndNode.screenSize.height,
    };
  };
}
