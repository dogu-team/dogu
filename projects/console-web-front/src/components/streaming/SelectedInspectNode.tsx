import { Tooltip } from 'antd';
import styled from 'styled-components';

import { InspectNodeAttributes, InspectNodeWithPosition } from '../../types/inspector';

interface Props {
  nodeInfo: InspectNodeWithPosition<InspectNodeAttributes>;
}

const SelectedInspectNode = ({ nodeInfo }: Props) => {
  return (
    <Tooltip
      title={
        <div>
          {/* <p style={{ wordBreak: 'break-all' }}>
            <b style={{ color: 'red' }}>Path:</b>&nbsp;{nodeInfo.node.title}
          </p> */}
          <p style={{ wordBreak: 'break-all' }}>
            <b style={{ color: 'yellow' }}>Name:</b>&nbsp;{nodeInfo.node.title}
          </p>
        </div>
      }
      open
      overlayStyle={{ fontSize: '.6rem' }}
      overlayInnerStyle={{ padding: '4px' }}
    >
      <Box style={{ top: `${nodeInfo.position.y}px`, left: `${nodeInfo.position.x}px`, width: `${nodeInfo.position.width}px`, height: `${nodeInfo.position.height}px` }} />
    </Tooltip>
  );
};

export default SelectedInspectNode;

const Box = styled.div`
  position: absolute;
  background-color: #609af766;
  z-index: 10;
`;
