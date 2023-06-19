import styled from 'styled-components';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Tree } from 'antd';
import { DataNode } from 'antd/es/tree';

const treeData: DataNode[] = [
  {
    title: 'parent 0',
    key: '0-0',
    children: [
      { title: 'leaf 0-0', key: '0-0-0', isLeaf: true },
      { title: 'leaf 0-1', key: '0-0-1', isLeaf: true },
    ],
  },
  {
    title: 'parent 1',
    key: '0-1',
    children: [
      { title: 'leaf 1-0', key: '0-1-0', isLeaf: true },
      { title: 'leaf 1-1', key: '0-1-1', isLeaf: true },
    ],
  },
];

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const FileBrowser = (props: Props) => {
  return (
    <Box>
      <Tree.DirectoryTree multiple defaultExpandAll onSelect={() => {}} onExpand={() => {}} treeData={treeData} />
    </Box>
  );
};

export default FileBrowser;

const Box = styled.div`
  display: flex;
`;
