import { plainToInstance } from 'class-transformer';

import {
  ConvertElementToNodeFunc,
  DeviceRotationDirection,
  GetDeviceRotationFunc,
  GetDeviceScreenSizeFunc,
  GetInspectingAreaFunc,
  GetNodeBoundFunc,
  IosNode,
  IosNodeAttributeFields,
  IosNodeAttributes,
  NodeUtilizer,
  PageSourceParser,
  ParseToNodeFunc,
} from './types';

export class IosPageSourceParser extends PageSourceParser<IosNodeAttributes> {
  public convertElementToNode: ConvertElementToNodeFunc<IosNodeAttributes> = (element, parentNode, index) => {
    const json: IosNode = {
      tag: element.nodeName,
      key: '',
      title: '',
      attributes: {
        index: index ?? 1,
      },
    };

    const rawAttributes: { [key in IosNodeAttributeFields]?: IosNodeAttributes[key] } = {};

    // Convert element attributes to JSON properties
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      const attrName = attr.name as keyof IosNodeAttributes;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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

  public parseToNode: ParseToNodeFunc<IosNodeAttributes> = () => {
    const result = this.convertElementToNode(this.rootElement);
    return result;
  };
}

export class IosNodeUtilizer extends NodeUtilizer<IosNodeAttributes> {
  public getNodeBound: GetNodeBoundFunc<IosNodeAttributes> = (node) => {
    const { x, y, width, height } = node.attributes;

    return {
      x: x || 0,
      y: y || 0,
      width: width || 0,
      height: height || 0,
    };
  };

  public getInspectingArea: GetInspectingAreaFunc = () => {
    const android = this.contextAndNode.android;

    if (!android) {
      return {
        x: 0,
        y: 0,
        ...this.contextAndNode.screenSize,
      };
    }

    const rotation = this.getDeviceRotation();
    const screenSize = this.getDeviceScreenSize();

    const isStatusBarVisible = android.statusBar.visible;
    const isNavigationBarVisible = android.navigationBar.visible;

    switch (rotation) {
      case DeviceRotationDirection.TOP_DOWN:
        return {
          x: 0,
          y: isStatusBarVisible ? android.statusBar.height : 0,
          width: this.contextAndNode.node.attributes.width || screenSize.width,
          height: isNavigationBarVisible ? screenSize.height - android.statusBar.height - android.navigationBar.height : screenSize.height - android.statusBar.height,
        };
      case DeviceRotationDirection.LEFT:
        return {
          x: 0,
          y: isStatusBarVisible ? android.statusBar.height : 0,
          width: isNavigationBarVisible ? screenSize.width - android.navigationBar.width : screenSize.width,
          height: isStatusBarVisible ? screenSize.height - android.statusBar.height : screenSize.height,
        };
      case DeviceRotationDirection.RIGHT:
        return {
          x: isNavigationBarVisible ? android.navigationBar.width : 0,
          y: isStatusBarVisible ? android.statusBar.height : 0,
          width: isNavigationBarVisible ? screenSize.width - android.navigationBar.width : screenSize.width,
          height: isStatusBarVisible ? screenSize.height - android.statusBar.height : screenSize.height,
        };
      case DeviceRotationDirection.UPSIDE_DOWN:
        return {
          x: 0,
          y: android.statusBar.height,
          width: this.contextAndNode.node.attributes.width || screenSize.width,
          height: isNavigationBarVisible ? screenSize.height - android.statusBar.height - android.navigationBar.height : screenSize.height - android.statusBar.height,
        };
      default:
        return {
          x: 0,
          y: 0,
          width: this.contextAndNode.node.attributes.width || screenSize.width,
          height: this.contextAndNode.node.attributes.height || screenSize.height,
        };
    }
  };

  public getDeviceRotation: GetDeviceRotationFunc = () => {
    return DeviceRotationDirection.TOP_DOWN;
  };

  public getDeviceScreenSize: GetDeviceScreenSizeFunc = () => {
    return this.contextAndNode.screenSize;
  };
}
