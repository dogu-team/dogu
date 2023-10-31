import { deviceArrayByDisplay } from '@dogu-private/device-data';
import GroupNode from './GroupNode';
import { PageImageProps } from './PageImage';

export interface Node {
  id: string;
  type: keyof typeof nodeTypes;
  position: { x: number; y: number };
  data: any;
}

export const nodeTypes = {
  groupNode: GroupNode,
};

export const nodes: Node[] = [
  {
    id: 'Apple',
    type: 'groupNode',
    position: { x: 0, y: 0 },
    data: {
      category: 'Apple',
      pageImageItems: [],
    },
  },
  {
    id: 'Samsung',
    type: 'groupNode',
    position: { x: 0, y: 1920 },
    data: {
      category: 'Samsung',
      pageImageItems: [],
    },
  },
];

const appleNodes = nodes[0];
const samsungNodes = nodes[1];

const appendAppleNodes = () => {
  for (const display in deviceArrayByDisplay) {
    const [width, height] = display.split('x');
    const devices = deviceArrayByDisplay[display];

    const appleDevices = devices.filter((device) => device.vendor === 'Apple');
    if (appleDevices.length !== 0) {
      const pageImageItem = {
        width: Number(width),
        height: Number(height),
        imageUrl: `https://storage.googleapis.com/responsive_web_page/4f7a8d9b-3c2e-4b15-b8fc-0e5a4e9c3c52/${display}.jpeg`,
        devices: appleDevices,
      };

      appleNodes.data.pageImageItems.push(pageImageItem);
    }
  }

  appleNodes.data.pageImageItems.sort((a: PageImageProps, b: PageImageProps) => {
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

const appendSamsungNodes = () => {
  for (const display in deviceArrayByDisplay) {
    const [width, height] = display.split('x');
    const devices = deviceArrayByDisplay[display];

    const samsungDevices = devices.filter((device) => device.vendor === 'Samsung');
    if (samsungDevices.length !== 0) {
      const pageImageItem = {
        width: Number(width),
        height: Number(height),
        imageUrl: `https://storage.googleapis.com/responsive_web_page/4f7a8d9b-3c2e-4b15-b8fc-0e5a4e9c3c52/${display}.jpeg`,
        devices: samsungDevices,
      };

      console.log(
        `https://storage.googleapis.com/responsive_web_page/4f7a8d9b-3c2e-4b15-b8fc-0e5a4e9c3c52/${display}.jpeg`,
      );

      samsungNodes.data.pageImageItems.push(pageImageItem);
    }
  }
};

const sortNodes = (node: Node) => {
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

appendAppleNodes();
appendSamsungNodes();
sortNodes(appleNodes);
sortNodes(samsungNodes);
