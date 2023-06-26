import { ScreenSize } from '@dogu-tech/device-client-common';

import { ContextAndNode, InspectNode, NodePosition } from 'src/types/inspector';

export enum AppiumRotation {
  PORTRAIT = 0,
  LANDSCAPE_LEFT = 1,
  PORTRAIT_UPSIDE_DOWN = 2,
  LANDSCAPE_RIGHT = 3,
}

export enum GamiumRotation {
  PORTRAIT = 'Portrait',
  LANDSCAPE_LEFT = 'LandscapeLeft',
  LANDSCAPE_RIGHT = 'LandscapeRight',
  PORTRAIT_UPSIDE_DOWN = 'PortraitUpsideDown',
  AUTO_ROTATION = 'AutoRotation',
}

export enum DeviceRotationDirection {
  TOP_DOWN,
  LEFT,
  UPSIDE_DOWN,
  RIGHT,
}

export type GetInspectingAreaFunc = () => NodePosition;
export type GetNodeBoundFunc<A> = (node: InspectNode<A>) => NodePosition;
export type GetDeviceScreenSizeFunc = () => ScreenSize;
export type GetDeviceRotationFunc = () => DeviceRotationDirection;

export abstract class InspectorModule<A> {
  protected contextAndNode: ContextAndNode<A>;

  constructor(contextAndNode: ContextAndNode<A>) {
    this.contextAndNode = contextAndNode;
  }

  abstract getInspectingArea: GetInspectingAreaFunc;
  abstract getNodeBound: GetNodeBoundFunc<A>;
  abstract getDeviceRotation: GetDeviceRotationFunc;
  abstract getDeviceScreenSize: GetDeviceScreenSizeFunc;
}

// index is same tagName index
export type GetXPathFunc = (element: Element, parentPath: string, index?: number) => string;
export type ConvertElementToNodeFunc<A> = (element: Element, parentNode?: InspectNode<A>, index?: number) => InspectNode<A>;
export type ParseFunc<A> = () => InspectNode<A>;

export abstract class InspectorElementParser<A> {
  public rootElement: Element;

  constructor(rootElement: Element) {
    this.rootElement = rootElement;
  }

  public getChildIndexes: (element: Element) => (number | undefined)[] = (element) => {
    const childTagNames = Array.from(element.childNodes).map((elem) => (elem as Element).tagName);

    const indexMap: { [key: string]: undefined | number } = {};
    const indexes: (number | undefined)[] = Array.from({ length: childTagNames.length });

    for (let i = 0; i < childTagNames.length; i++) {
      const item = childTagNames[i];
      const value = indexMap[item];
      if (value === undefined) {
        indexMap[item] = 1;
      } else {
        if (value === 1) {
          const idx = childTagNames.findIndex((name) => name === item);
          indexes[idx] = 1;
        }
        indexes[i] = value + 1;
        indexMap[item] = value + 1;
      }
    }

    return indexes;
  };

  abstract getXpath: GetXPathFunc;
  abstract convertElementToNode: ConvertElementToNodeFunc<A>;
  abstract parse: ParseFunc<A>;
}
