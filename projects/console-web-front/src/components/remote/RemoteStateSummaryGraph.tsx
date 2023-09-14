import { getRemoteDeviceJobState, RemoteDeviceJobBase } from '@dogu-private/console';
import { Pie, PieChart } from 'recharts';
import styled from 'styled-components';

import { remoteStatusColor } from '../../utils/mapper';

interface Props {
  remoteJobs?: RemoteDeviceJobBase[];
}

const RemoteStateSummaryGraph = ({ remoteJobs }: Props) => {
  if (!remoteJobs) return null;

  const data = remoteJobs.map((job) => {
    const state = getRemoteDeviceJobState(job);
    return {
      name: job.device?.name,
      value: state,
      fill: remoteStatusColor[state],
    };
  });

  return (
    <PieChart width={20} height={20}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="state"
        cx="50%"
        cy="50%"
        innerRadius={4}
        outerRadius={10}
        fill="#8884d8"
      />
    </PieChart>
  );
};

export default RemoteStateSummaryGraph;

const TooltipBox = styled.div`
  width: 10rem;
  background-color: #fff;
  border: 1px solid #ccc;
  font-size: 0.75rem;
  z-index: 10;
`;

const TotalBox = styled.div`
  margin-bottom: 0.5rem;
`;

const TooltipItem = styled.p`
  padding: 0.25rem;
`;
