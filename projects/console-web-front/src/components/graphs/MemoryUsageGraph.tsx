import { useCallback } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import styled from 'styled-components';
import { RuntimeInfoGraphBaseProps } from '../../types/graph';
import { MemoryUsageInfo } from '../../utils/runtime-info-parser';
import DeviceRuntimeInfoTooltip from './DeviceRuntimeInfoTooltip';

interface Props extends RuntimeInfoGraphBaseProps<MemoryUsageInfo> {}

const MemoryUsageGraph = ({ data, durationTicks, empty, durationTicksFormatter }: Props) => {
  const getTotal = useCallback((payload: TooltipProps<number | string, string>['payload']) => {
    const filtered = payload?.filter((item) => ['used'].includes(`${item.dataKey}`));

    if (!!filtered?.length) {
      return `${filtered.reduce((acc, cur) => acc + Number(cur.value), 0)}`;
    }

    return '0';
  }, []);

  return (
    <Box>
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <YAxis dataKey="total" unit="GB" />
          <XAxis
            type={durationTicks ? 'number' : undefined}
            dataKey="timestamp"
            domain={durationTicks ? [0, durationTicks[durationTicks.length - 1]] : undefined}
            ticks={durationTicks}
            tickFormatter={durationTicksFormatter}
          />
          {data.length > 0 && <ReferenceLine y={data[0].total} stroke="red" />}
          <Area
            type="monotone"
            dataKey="used"
            name="User"
            stackId="1"
            isAnimationActive={false}
            stroke="#82ca9d"
            fill="#82ca9d"
            unit="GB"
          />
          <Line
            type="monotone"
            dataKey="foreground"
            name="Foreground"
            isAnimationActive={false}
            stroke="#0000ff"
            unit="GB"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="foregroundProcName"
            isAnimationActive={false}
            stroke="none"
            dot={false}
            legendType="none"
          />
          <Legend />
          <Tooltip
            content={<DeviceRuntimeInfoTooltip isDurationTicks={!!durationTicks} getTotal={getTotal} totalUnit="GB" />}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {data.length === 0 && !!empty && <EmptyBox>{empty}</EmptyBox>}
    </Box>
  );
};

export default MemoryUsageGraph;

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
