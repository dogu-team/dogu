import { FcFolder } from 'react-icons/fc';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import File from './File';
import { ExplorerNode, ExplorerTree } from './type';

interface Props {
  tree: ExplorerTree;
  selectedNode: ExplorerNode;
  child: ExplorerNode;
  onClick: (node: ExplorerNode) => void;
  expanded: boolean;
}

const Direcotry = (props: Props) => {
  const node = props.tree[props.child.name];
  const [expanded, setExpanded] = useState<boolean>(props.expanded);

  const parseDirectoryName = (dirPath: string) => {
    const arr = dirPath.split('/');
    return arr[arr.length - 1];
  };

  const onExpand = () => {
    if (!expanded) {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  };

  const Children = () => {
    return node.children.map((child) => {
      const key = `${node.depth}/${child.name}`;

      if (child.type === 'file') {
        return <File key={key} depth={node.depth + 1} child={child} selectedNode={props.selectedNode} onClick={props.onClick} />;
      } else {
        return <Direcotry key={key} tree={props.tree} child={child} selectedNode={props.selectedNode} onClick={props.onClick} expanded={true} />;
      }
    });
  };

  return (
    <Box>
      <DirectoryContainer style={{ marginLeft: `${node.depth * 16}px` }}>
        <Button type="text" style={{ display: 'flex', flexDirection: 'row', justifyItems: 'center', alignItems: 'center', margin: 0, padding: 0 }} onClick={onExpand}>
          <FcFolder style={{ fontSize: '1.2rem' }} />
          <p style={{ marginLeft: '0.5rem' }}>{parseDirectoryName(props.child.name)}</p>
        </Button>
      </DirectoryContainer>
      {expanded && <ExpandedContainer>{Children()}</ExpandedContainer>}
    </Box>
  );
};

const Box = styled.div`
  display: flex;
  flex-direction: column;
`;

const DirectoryContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const ExpandedContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export default Direcotry;
