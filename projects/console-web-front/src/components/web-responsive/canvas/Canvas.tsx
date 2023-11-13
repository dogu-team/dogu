import 'reactflow/dist/style.css';

import React from 'react';
import ReactFlow, { Controls } from 'reactflow';

import { createNodes, nodeTypes } from './node/Nodes';
import { TestExecutorWebResponsiveSnapshotMap } from '@dogu-private/console';

interface Props {
  snapshots: TestExecutorWebResponsiveSnapshotMap;
}

const Canvas = (props: Props) => {
  const nodes = createNodes(props.snapshots);

  return (
    <ReactFlow nodes={nodes} nodeTypes={nodeTypes} minZoom={0} maxZoom={50} nodesDraggable={false} fitView>
      <Controls />
    </ReactFlow>
  );
};

export default Canvas;
