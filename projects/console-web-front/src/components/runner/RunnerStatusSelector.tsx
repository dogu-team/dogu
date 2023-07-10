import { DeviceConnectionState } from '@dogu-private/types';
import { Checkbox } from 'antd';
import styled from 'styled-components';

import useRunnerFilterStore from 'src/stores/runner-filter';
import RunnerConnectionStateTag from './RunnerConnectionStateTag';

const status = [DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED, DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED, DeviceConnectionState.UNRECOGNIZED];

const RunnerStatusSelector = () => {
  const { filterValue, updateFilter } = useRunnerFilterStore();

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      {status.map((item) => (
        <StyledCheckbox
          key={`device-fileter-${item}`}
          checked={filterValue.states.includes(item)}
          onChange={() =>
            updateFilter({
              states: (prev) => {
                if (prev.includes(item)) {
                  return prev.filter((st) => st !== item);
                }

                return [...prev, item].sort((a, b) => a - b);
              },
            })
          }
        >
          <RunnerConnectionStateTag connectionState={item} />
        </StyledCheckbox>
      ))}
    </Box>
  );
};

export default RunnerStatusSelector;

const Box = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledCheckbox = styled(Checkbox)`
  margin: 0.3rem 0;
  margin-left: 0 !important;
  user-select: none;
`;
