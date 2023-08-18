import { Android } from '@dogu-tech/device-client-common';
import { plainToInstance } from 'class-transformer';

import {
  AndroidNode,
  AndroidNodeAttributeFields,
  AndroidNodeAttributes,
  AppiumRotation,
  ConvertElementToNodeFunc,
  DeviceRotationDirection,
  GetDeviceRotationFunc,
  GetDeviceScreenSizeFunc,
  GetInspectingAreaFunc,
  GetNodeBoundFunc,
  NodeUtilizer,
  PageSourceParser,
  ParsedNode,
  ParseToNodeFunc,
} from './types';

export class AndroidPageSourceParser extends PageSourceParser<AndroidNodeAttributes> {
  public convertElementToNode: ConvertElementToNodeFunc<AndroidNodeAttributes> = (element, parentNode, index) => {
    const json: AndroidNode = {
      tag: element.nodeName,
      key: '',
      title: '',
      attributes: {
        index: index ?? 1,
      },
    };

    const rawAttributes: { [key in AndroidNodeAttributeFields]?: AndroidNodeAttributes[key] } = {};

    // Convert element attributes to JSON properties
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      const attrName = attr.name as keyof AndroidNodeAttributes;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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

  public parseToNode: ParseToNodeFunc<AndroidNodeAttributes> = () => {
    const result = this.convertElementToNode(this.rootElement);
    return result;
  };
}

export class AndroidNodeUtilizer extends NodeUtilizer<AndroidNodeAttributes> {
  public getNodeBound: GetNodeBoundFunc<AndroidNodeAttributes> = (node) => {
    const { bounds } = node.attributes;

    if (bounds) {
      return {
        x: bounds.start[0],
        y: bounds.start[1],
        width: bounds.end[0] - bounds.start[0],
        height: bounds.end[1] - bounds.start[1],
      };
    }

    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  };

  public getNodesByPosition: (x: number, y: number) => ParsedNode<AndroidNodeAttributes>[] = (x, y) => {
    type DepthNode = {
      depth: number;
      node: ParsedNode<AndroidNodeAttributes>[];
    };

    function getElementDepth(node: ParsedNode<AndroidNodeAttributes>, depth: number): DepthNode[] {
      const currentElement: DepthNode[] = [
        {
          depth: depth,
          node: [node],
        },
      ];
      if (!node.children || node.children.length === 0) {
        return currentElement;
      }
      const childElements = node.children.flatMap((childNode) => {
        return getElementDepth(childNode, depth + 1);
      });
      return currentElement.concat(childElements);
    }

    function depthwiseNodeList(rootNode: ParsedNode<AndroidNodeAttributes>): DepthNode[] {
      if (!rootNode.children || rootNode.children.length === 0) {
        return [];
      }

      const elementsDepthGrouped: DepthNode[] = rootNode.children?.flatMap((child) => getElementDepth(child, 0));

      const depthwiseList: DepthNode[] = [];
      for (const element of elementsDepthGrouped) {
        const existingDepth = depthwiseList.findIndex((e) => e.depth === element.depth);

        if (existingDepth > -1) {
          depthwiseList[existingDepth].node.push(...element.node);
        } else {
          depthwiseList.push(element);
        }
      }
      return depthwiseList;
    }

    function getTargetNodes(depthwiseList: DepthNode[], x: number, y: number): ParsedNode<AndroidNodeAttributes>[] {
      const reverse = depthwiseList.reverse();

      const candidates: ParsedNode<AndroidNodeAttributes>[] = [];
      for (const node of reverse) {
        for (const child of node.node) {
          if (child.attributes && child.attributes.bounds) {
            const left = child.attributes.bounds.start[0];
            const top = child.attributes.bounds.start[1];
            const right = child.attributes.bounds.end[0];
            const bottom = child.attributes.bounds.end[1];

            if (x >= left && x <= right && y >= top && y <= bottom) {
              candidates.push(child);
            }
          }
        }
      }
      return candidates;
    }

    const depthwiseList = depthwiseNodeList(this.contextAndNode.node);
    const targetNodes = getTargetNodes(depthwiseList, x, y);
    return targetNodes;
  };

  public getInspectingArea: GetInspectingAreaFunc = () => {
    const android: Android | undefined = this.contextAndNode.android;

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
    const { rotation } = this.contextAndNode.node.attributes;

    switch (rotation) {
      case AppiumRotation.PORTRAIT:
        return DeviceRotationDirection.TOP_DOWN;
      case AppiumRotation.LANDSCAPE_LEFT:
        return DeviceRotationDirection.LEFT;
      case AppiumRotation.LANDSCAPE_RIGHT:
        return DeviceRotationDirection.RIGHT;
      case AppiumRotation.PORTRAIT_UPSIDE_DOWN:
        return DeviceRotationDirection.UPSIDE_DOWN;
      default:
        return DeviceRotationDirection.TOP_DOWN;
    }
  };

  public getDeviceScreenSize: GetDeviceScreenSizeFunc = () => {
    const rotation = this.getDeviceRotation();

    switch (rotation) {
      case DeviceRotationDirection.TOP_DOWN:
      case DeviceRotationDirection.UPSIDE_DOWN:
        return this.contextAndNode.screenSize;
      case DeviceRotationDirection.LEFT:
      case DeviceRotationDirection.RIGHT:
        return {
          width: this.contextAndNode.screenSize.height,
          height: this.contextAndNode.screenSize.width,
        };
      default:
        return this.contextAndNode.screenSize;
    }
  };
}
