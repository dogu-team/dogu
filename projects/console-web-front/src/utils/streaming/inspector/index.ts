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
