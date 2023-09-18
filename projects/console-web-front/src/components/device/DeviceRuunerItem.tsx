import { DeviceRunnerBase } from '@dogu-private/console';
import { Tooltip } from 'antd';
import { GoBrowser } from 'react-icons/go';
import { MdSubdirectoryArrowRight } from 'react-icons/md';
import styled from 'styled-components';

import RunnerUsageStatusBadge from './RunnerUsageStatusBadge';

interface Props {
  runner: DeviceRunnerBase;
  index: number;
  hideStatus?: boolean;
}

const DeviceRunnerItem: React.FC<Props> = ({ runner, index, hideStatus }) => {
  return (
    <Box>
      <MdSubdirectoryArrowRight style={{ marginRight: '.5rem' }} />

      <Tooltip title="Browser">
        <GoBrowser style={{ marginRight: '.25rem' }} />
      </Tooltip>

      <div>Runner {index}</div>
      {!hideStatus && (
        <div style={{ marginLeft: '2rem' }}>
          <RunnerUsageStatusBadge runner={runner} />
        </div>
      )}
    </Box>
  );
};

export default DeviceRunnerItem;

const Box = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  align-items: center;
  line-height: 1.5;
`;
