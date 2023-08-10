import { NodeAttributes, NodeWithPosition } from '@dogu-private/console';
import { Tooltip } from 'antd';
import styled from 'styled-components';

interface Props {
  nodeInfo: NodeWithPosition<NodeAttributes>;
}

const InspectorSelectedNode = ({ nodeInfo }: Props) => {
  const pathValue = nodeInfo.node.attributes.path;
  const splited = pathValue?.split('/');
  const displayedPath = !!splited && splited.length > 5 ? splited.slice(0, 4).join('/') + '/.../' + splited[splited.length - 1] : pathValue;

  return (
    <Tooltip
      title={
        <div>
          {!!nodeInfo.node.attributes.path && (
            <p style={{ wordBreak: 'break-all' }}>
              <b style={{ color: 'red' }}>Xpath:</b>&nbsp;{displayedPath}
            </p>
          )}
          <p style={{ wordBreak: 'break-all' }}>
            <b style={{ color: 'yellow' }}>Name:</b>&nbsp;{nodeInfo.node.title}
          </p>
        </div>
      }
      key={nodeInfo.node.key}
      open
      overlayStyle={{ fontSize: '.6rem' }}
      overlayInnerStyle={{ padding: '4px' }}
    >
      <Box style={{ top: `${nodeInfo.position.y}px`, left: `${nodeInfo.position.x}px`, width: `${nodeInfo.position.width}px`, height: `${nodeInfo.position.height}px` }} />
    </Tooltip>
  );
};

export default InspectorSelectedNode;

const Box = styled.div`
  position: absolute;
  background-color: #609af766;
  z-index: 10;
`;
