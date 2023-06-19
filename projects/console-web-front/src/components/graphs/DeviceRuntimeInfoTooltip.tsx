import { TooltipProps } from 'recharts';
import styled from 'styled-components';
import { stringifyDuration } from '../../utils/date';

interface Props extends TooltipProps<number | string, string> {
  isDurationTicks?: boolean;
  hiddenForegroundProcName?: boolean;
  getTotal?: (payload: Props['payload']) => string;
  totalUnit?: string;
}

const DeviceRuntimeInfoTooltip = ({ isDurationTicks, hiddenForegroundProcName, getTotal, totalUnit, ...props }: Props) => {
  if (!!props.payload?.length && props.active && props.label) {
    const payloadWithoutProcessName = props.payload.filter((item) => item.dataKey !== 'foregroundProcName');

    return (
      <TooltipBox>
        <TooltipContent>{isDurationTicks ? stringifyDuration(props.label) : props.label}</TooltipContent>
        {!hiddenForegroundProcName && (
          <TooltipContent>
            <b style={{ fontWeight: '700' }}>Foreground App</b>
            <p>{props.payload.find((item) => item.dataKey === 'foregroundProcName')?.value ?? '-'}</p>
          </TooltipContent>
        )}
        {!!getTotal && !!totalUnit && (
          <div>
            Total: {getTotal(props.payload)}
            {totalUnit}
          </div>
        )}
        <TooltipContent>
          {payloadWithoutProcessName.map((item) => (
            <div key={item.dataKey} style={{ color: item.color }}>
              {item.name}: {item.value}
              {item.unit}
            </div>
          ))}
        </TooltipContent>
      </TooltipBox>
    );
  }

  return null;
};

export default DeviceRuntimeInfoTooltip;

const TooltipBox = styled.div`
  background-color: #ffffff;
  padding: 0.5rem;
  border: 1px solid #dcdcdc;
  font-size: 0.8rem;
`;

const TooltipContent = styled.div`
  padding: 0.25rem 0;
  line-height: 1.4;
`;
