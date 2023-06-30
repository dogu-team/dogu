import { QuestionCircleFilled } from '@ant-design/icons';
import { Tag } from 'antd';

interface Props {
  version: string | null;
}

const HostVesrsionBadge = ({ version }: Props) => {
  if (!version) {
    return <Tag color="red">N/A</Tag>;
  }

  return <Tag color="blue">{version}</Tag>;
};

export default HostVesrsionBadge;
