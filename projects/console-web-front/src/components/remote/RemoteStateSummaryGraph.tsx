import { RemoteDeviceJobBase } from '@dogu-private/console';
import { Pie, PieChart } from 'recharts';

interface Props {
  remoteJobs?: RemoteDeviceJobBase[];
}

const data = [
  { name: 'Group A', value: 1, fill: '#0088FE' },
  { name: 'Group B', value: 1, fill: '#00C49F' },
  { name: 'Group C', value: 1, fill: '#FFBB28' },
  { name: 'Group D', value: 1, fill: '#FF8042' },
];

const RemoteStateSummaryGraph = ({ remoteJobs }: Props) => {
  if (!remoteJobs) return null;

  return (
    <PieChart width={24} height={24}>
      <Pie data={data} dataKey="value" nameKey="state" cx="50%" cy="50%" innerRadius={6} outerRadius={12} fill="#8884d8" />
    </PieChart>
  );
};

export default RemoteStateSummaryGraph;
