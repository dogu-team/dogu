import styled from 'styled-components';
import { OrganizationId, ProjectId } from '@dogu-private/types';

import FileTree from './FileTree';
import { ExplorerNode, ExplorerTree } from './type';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
  tree: ExplorerTree;
  selectedNode: ExplorerNode;
  onClick: (node: ExplorerNode) => void;
}

const FileExplorer = (props: Props) => {
  return (
    <Box>
      <FileTree tree={props.tree} selectedNode={props.selectedNode} onClick={props.onClick} />
    </Box>
  );
};

const Box = styled.div`
  display: flex;
`;

export default FileExplorer;
