import 'reactflow/dist/style.css';

import React from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';

import { createNodes, nodeTypes } from './node/Nodes';
import { Vendor } from '@dogu-private/device-data';
import { TestExecutorWebResponsiveSnapshotMap } from '@dogu-private/console';

interface Props {
  snapshots: TestExecutorWebResponsiveSnapshotMap;
}

const Canvas = (props: Props) => {
  const nodes = createNodes(props.snapshots);

  return (
    <ReactFlow nodes={nodes} nodeTypes={nodeTypes} minZoom={0} maxZoom={100} nodesDraggable={false}>
      <Controls />
    </ReactFlow>
  );
};

export default Canvas;
