import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, QuestionCircleFilled } from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';

interface Props {
  version: string | null;
}

const HostVesrsionBadge = ({ version }: Props) => {
  const currentVersion = process.env.NEXT_PUBLIC_DOGU_VERSION;
  // isMatched should be true when major, minor version is same
  const isMatched = currentVersion?.split('.').slice(0, 2).join('.') === version?.split('.').slice(0, 2).join('.');
  const isMajorMatched = currentVersion?.split('.')[0] === version?.split('.')[0];

  if (!version) {
    return <Tag color="default">N/A</Tag>;
  }

  return (
    <Tooltip
      title={`Dogu and Agent version not matched!\nThis can result in unexpected behavior.\nDogu: ${currentVersion}, Agent: ${version}`}
      open={isMatched ? false : undefined}
      overlayInnerStyle={{ fontSize: '.8rem', textAlign: 'center', whiteSpace: 'pre-wrap' }}
    >
      <Tag
        color={isMatched ? 'green' : isMajorMatched ? 'warning' : 'error'}
        icon={isMatched ? <CheckCircleOutlined /> : isMajorMatched ? <ExclamationCircleOutlined /> : <CloseCircleOutlined />}
      >
        {version}
      </Tag>
    </Tooltip>
  );
};

export default HostVesrsionBadge;
