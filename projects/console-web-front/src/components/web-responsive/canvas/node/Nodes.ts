import { getDevicesByDisplay } from '@dogu-private/device-data';

import { TestExecutorWebResponsiveSnapshot, TestExecutorWebResponsiveSnapshotMap } from '@dogu-private/console';
import { PageImageProps } from '../PageImage';
import GroupNode, { GroupNodeDataProps } from './GroupNode';

export interface Node {
  id: string;
  type: keyof typeof nodeTypes;
  position: { x: number; y: number };
  data: any;
}

export const nodeTypes = {
  groupNode: GroupNode,
};

export function createNodes(snapshotMap: TestExecutorWebResponsiveSnapshotMap): Node[] {
  const nodes: Node[] = [];

  const POSITION_X_GAP = 1920 * 5;
  let currentPositionX = 0;

  for (const url in snapshotMap) {
    const snapshot = snapshotMap[url];
    snapshot.vendors.sort();

    const groupNodeProps: GroupNodeDataProps = {
      url: url,
      vendors: snapshot.vendors,
      pageImagePropsMap: {},
    };

    const node: Node = {
      id: url,
      type: 'groupNode',
      position: { x: currentPositionX, y: 0 },
      data: groupNodeProps,
    };

    appendImagesToNode(node, snapshot);
    nodes.push(node);

    currentPositionX += POSITION_X_GAP;
  }

  return nodes;
}

const appendImagesToNode = (node: Node, snapshot: TestExecutorWebResponsiveSnapshot) => {
  for (const vendor of snapshot.vendors) {
    node.data.pageImagePropsMap[vendor] = [];
    const pageImageProps = node.data.pageImagePropsMap[vendor];

    const devicesByDisplay = getDevicesByDisplay([vendor]);

    for (const display in devicesByDisplay) {
      const [width, height] = display.split('x');
      const devices = devicesByDisplay[display];

      const pageImagePropsItem = {
        width: Number(width),
        height: Number(height),
        imageUrl: snapshot['images'][display],
        devices: devices,
      };

      pageImageProps.push(pageImagePropsItem);
    }

    pageImageProps.sort((a: PageImageProps, b: PageImageProps) => {
      const aWidth = a.width;
      const bWidth = b.width;

      if (aWidth < bWidth) {
        return -1;
      }

      if (aWidth > bWidth) {
        return 1;
      }

      return 0;
    });
  }
};
