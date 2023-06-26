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

export type GetXPathFunc = (element: Element, parentPath: string, index?: number) => string;
export type ConvertElementToNodeFunc<A> = (element: Element, parentNode?: InspectNode<A>) => InspectNode<A>;
export type ParseFunc<A> = () => InspectNode<A>;

export abstract class InspectorElementParser<A> {
  public rootElement: Element;

  constructor(rootElement: Element) {
    this.rootElement = rootElement;
  }

  abstract getXpath: GetXPathFunc;
  abstract convertElementToNode: ConvertElementToNodeFunc<A>;
  abstract parse: ParseFunc<A>;
}
