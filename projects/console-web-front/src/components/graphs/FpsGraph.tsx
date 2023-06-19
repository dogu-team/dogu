import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styled from 'styled-components';

import { RuntimeInfoGraphBaseProps } from '../../types/graph';
import { GameFpsInfo } from '../../utils/runtime-info-parser';
import DeviceRuntimeInfoTooltip from './DeviceRuntimeInfoTooltip';

interface Props extends RuntimeInfoGraphBaseProps<GameFpsInfo> {}

const FpsGraph = ({ data, empty, durationTicks, durationTicksFormatter }: Props) => {
  return (
    <Box>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type={durationTicks ? 'number' : undefined}
            dataKey="timestamp"
            domain={durationTicks ? [0, durationTicks[durationTicks.length - 1]] : undefined}
            ticks={durationTicks}
            tickFormatter={durationTicksFormatter}
          />
          <YAxis dataKey="fps" />
          <Line type="monotone" dataKey="fps" name="FPS" isAnimationActive={false} dot={false} />
          <Tooltip content={<DeviceRuntimeInfoTooltip isDurationTicks={!!durationTicks} hiddenForegroundProcName />} />
        </LineChart>
      </ResponsiveContainer>

      {data.length === 0 && !!empty && <EmptyBox>{empty}</EmptyBox>}
    </Box>
  );
};

export default FpsGraph;

const Box = styled.div`
  position: relative;
  width: 100%;
`;

const EmptyBox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff88;
`;
