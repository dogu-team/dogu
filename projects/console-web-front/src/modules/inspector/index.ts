import { ScreenSize } from '@dogu-tech/device-client-common';
import { ContextAndNode } from '../../hooks/streaming/useInspector';
import { DeviceRotationDirection, InspectNode } from '../../workers/native-ui-tree';

export type NodeBound = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type GetInspectingAreaFunc = () => NodeBound;
export type GetNodeBoundFunc = (node: InspectNode) => NodeBound;
export type GetDeviceScreenSizeFunc = () => ScreenSize;
export type GetDeviceRotationFunc = () => DeviceRotationDirection;

export abstract class InspectorModule {
  protected contextAndNode: ContextAndNode;

  constructor(contextAndNode: ContextAndNode) {
    this.contextAndNode = contextAndNode;
  }

  abstract getInspectingArea: GetInspectingAreaFunc;
  abstract getNodeBound: GetNodeBoundFunc;
  abstract getDeviceRotation: GetDeviceRotationFunc;
  abstract getDeviceScreenSize: GetDeviceScreenSizeFunc;
}
