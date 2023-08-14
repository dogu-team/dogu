import { useCallback } from 'react';
import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import styled from 'styled-components';

import { RuntimeInfoGraphBaseProps } from '../../types/graph';
import { CpuUsageInfo } from '../../utils/runtime-info-parser';
import DeviceRuntimeInfoTooltip from './DeviceRuntimeInfoTooltip';

interface Props extends RuntimeInfoGraphBaseProps<CpuUsageInfo> {}

const CpuUsageGraph = ({ data, empty, durationTicks, durationTicksFormatter }: Props) => {
  const getTotal = useCallback((payload: TooltipProps<number | string, string>['payload']) => {
    const filtered = payload?.filter((item) => ['system', 'user'].includes(`${item.dataKey}`));

    if (!!filtered?.length) {
      return `${Math.round(filtered.reduce((acc, cur) => acc + Number(cur.value), 0) * 1e2) / 1e2}`;
    }

    return '0';
  }, []);

  return (
    <Box>
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type={durationTicks ? 'number' : undefined}
            dataKey="timestamp"
            domain={durationTicks ? [0, durationTicks[durationTicks.length - 1]] : undefined}
            ticks={durationTicks}
            tickFormatter={durationTicksFormatter}
          />
          <YAxis domain={[0, 100]} unit="%" />
          <Area type="monotone" dataKey="system" name="System" stackId="1" isAnimationActive={false} stroke="#8884d8" fill="#8884d8" unit="%" />
          <Area type="monotone" dataKey="user" name="User" stackId="1" isAnimationActive={false} stroke="#82ca9d" fill="#82ca9d" unit="%" />
          <Line type="monotone" dataKey="foreground" name="Foregroud" isAnimationActive={false} stroke="#0000ff" unit="%" dot={false} />
          <Line type="monotone" dataKey="foregroundProcName" isAnimationActive={false} stroke="none" dot={false} legendType="none" />
          <Legend />
          <Tooltip content={<DeviceRuntimeInfoTooltip isDurationTicks={!!durationTicks} getTotal={getTotal} totalUnit="%" />} />
        </ComposedChart>
      </ResponsiveContainer>

      {data.length === 0 && !!empty && <EmptyBox>{empty}</EmptyBox>}
    </Box>
  );
};

export default CpuUsageGraph;

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
