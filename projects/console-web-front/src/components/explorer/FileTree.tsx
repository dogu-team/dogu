import styled from 'styled-components';

import File from './File';
import Direcotry from './Directory';
import { ExplorerNode, ExplorerTree } from './type';
import { useState } from 'react';

interface Props {
  tree: ExplorerTree;
  selectedNode: ExplorerNode;
  onClick: (node: ExplorerNode) => void;
}

const FileTree = (props: Props) => {
  const rootName = Object.keys(props.tree)[0];

  return (
    <Box>
      <Direcotry tree={props.tree} selectedNode={props.selectedNode} child={{ type: 'dir', name: rootName, path: rootName }} onClick={props.onClick} expanded={true} />
    </Box>
  );
};

const Box = styled.div`
  display: flex;
  flex-direction: column;
`;

export default FileTree;
