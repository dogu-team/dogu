import { QuestionCircleFilled } from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';

interface Props {
  version: string | null;
}

const HostVesrsionBadge = ({ version }: Props) => {
  const currentVersion = process.env.NEXT_PUBLIC_DOGU_VERSION;
  // isMatched should be true when major, minor version is same
  const isMatched = currentVersion?.split('.').slice(0, 2).join('.') === version?.split('.').slice(0, 2).join('.');

  if (!version) {
    return <Tag color="default">N/A</Tag>;
  }

  return (
    <Tooltip
      title={`Dost and Dogu version not matched!\nThis can result in unexpected behavior.\nDogu: ${currentVersion}, Dost: ${version}`}
      open={isMatched ? false : undefined}
      overlayInnerStyle={{ fontSize: '.8rem', textAlign: 'center' }}
    >
      <Tag color={isMatched ? 'blue' : 'warning'}>{version}</Tag>
    </Tooltip>
  );
};

export default HostVesrsionBadge;
