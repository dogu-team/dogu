import { FileOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import styled from 'styled-components';
import { SiTypescript } from 'react-icons/si';
import { AiOutlineFile } from 'react-icons/ai';

import { ExplorerNode } from './type';

interface Props {
  depth: number;
  selectedNode: ExplorerNode;
  child: ExplorerNode;
  onClick: (node: ExplorerNode) => void;
}

const File = (props: Props) => {
  const ExtensionIcon = (path: string) => {
    const splited = path.split('.');
    const extension = splited[splited.length - 1];

    switch (extension) {
      case 'ts':
        return <SiTypescript color="#E37933" />;
      default:
        return <AiOutlineFile />;
    }
  };

  return (
    <Box style={{ marginLeft: `${props.depth * 16}px` }}>
      <Button
        type="text"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyItems: 'center',
          alignItems: 'center',
          margin: 0,
          padding: 0,
          borderRadius: 0,
          backgroundColor: props.selectedNode.path === props.child.path ? '#F7F7F7' : 'transparent',
        }}
        onClick={() => {
          props.onClick(props.child);
        }}
      >
        {ExtensionIcon(props.child.path)}
        <p style={{ marginLeft: '0.5rem' }}>{props.child.name}</p>
      </Button>
    </Box>
  );
};

const Box = styled.div`
  display: flex;
  flex-direction: row;
`;

export default File;
