import 'reactflow/dist/style.css';

import React from 'react';
import ReactFlow, { Controls, Background, Handle, Position } from 'reactflow';
import { Node, nodes, nodeTypes } from './Nodes';

const Canvas = () => {
  return (
    <ReactFlow nodes={nodes} nodeTypes={nodeTypes} minZoom={0} maxZoom={100} nodesDraggable={false}>
      <Background />
      <Controls />
    </ReactFlow>
  );
};

export default Canvas;
