import { NodeAttributes, NodeWithPosition } from '@dogu-private/console';
import { Tooltip } from 'antd';
import styled from 'styled-components';
import { ResizedObjectInfo } from '../../types/streaming';

interface Props {
  nodeInfo: ResizedObjectInfo;
}

const GamiumInspectorSelectedNode = ({ nodeInfo }: Props) => {
  const pathValue = nodeInfo.origin.path;
  const splited = pathValue?.split('/');
  const displayedPath =
    !!splited && splited.length > 5 ? splited.slice(0, 4).join('/') + '/.../' + splited[splited.length - 1] : pathValue;

  return (
    <Tooltip
      title={
        <div>
          {!!pathValue && (
            <p style={{ wordBreak: 'break-all' }}>
              <b style={{ color: 'red' }}>Xpath:</b>&nbsp;{displayedPath}
            </p>
          )}
          <p style={{ wordBreak: 'break-all' }}>
            <b style={{ color: 'yellow' }}>Name:</b>&nbsp;{nodeInfo.origin.name}
          </p>
        </div>
      }
      key={nodeInfo.origin.path}
      open
      overlayStyle={{ fontSize: '.6rem' }}
      overlayInnerStyle={{ padding: '4px' }}
    >
      <Box
        style={{
          top: `${nodeInfo.y}px`,
          left: `${nodeInfo.x}px`,
          width: `${nodeInfo.width}px`,
          height: `${nodeInfo.height}px`,
        }}
      />
    </Tooltip>
  );
};

export default GamiumInspectorSelectedNode;

const Box = styled.div`
  position: absolute;
  background-color: #609af766;
  z-index: 10;
`;
