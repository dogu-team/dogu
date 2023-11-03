import { getDevicesByDisplay, Vendor } from '@dogu-private/device-data';

import { TestExecutorWebResponsiveSnapshots } from '@dogu-private/console';
import { PageImageProps } from '../PageImage';
import GroupNode from './GroupNode';

export interface Node {
  id: string;
  type: keyof typeof nodeTypes;
  position: { x: number; y: number };
  data: any;
}

export const nodeTypes = {
  groupNode: GroupNode,
};

export function createNodes(vendors: Vendor[], snapshots: TestExecutorWebResponsiveSnapshots): Node[] {
  vendors.sort();

  const POSITION_Y_GAP = 1920;
  let currentPositionY = 0;
  const nodes: Node[] = [];

  for (const vendor of vendors) {
    const node: Node = {
      id: vendor,
      type: 'groupNode',
      position: { x: 0, y: currentPositionY },
      data: {
        category: vendor,
        pageImageItems: [],
      },
    };

    appendImagesToNode(node, snapshots);
    nodes.push(node);

    currentPositionY += POSITION_Y_GAP;
  }

  return nodes;
}

const appendImagesToNode = (node: Node, snapshots: TestExecutorWebResponsiveSnapshots) => {
  const devicesByDisplay = getDevicesByDisplay([node.data.category]);

  console.log(snapshots);

  for (const display in devicesByDisplay) {
    const [width, height] = display.split('x');
    const devices = devicesByDisplay[display];

    const pageImageItem = {
      width: Number(width),
      height: Number(height),
      imageUrl: snapshots[display],
      devices: devices,
    };

    node.data.pageImageItems.push(pageImageItem);
  }

  node.data.pageImageItems.sort((a: PageImageProps, b: PageImageProps) => {
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
};
