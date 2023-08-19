import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, QuestionCircleFilled } from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';
import { parseSemver } from '../../utils/download';

interface Props {
  version: string | null;
}

const HostVesrsionBadge = ({ version }: Props) => {
  if (!version) {
    return <Tag color="default">N/A</Tag>;
  }

  const currentVersion = parseSemver(process.env.NEXT_PUBLIC_DOGU_VERSION);
  const agentVersion = parseSemver(version);

  const isMajorMatched = currentVersion.major === agentVersion.major;
  const isMatched = isMajorMatched && currentVersion.minor === agentVersion.minor;

  return (
    <Tooltip
      title={`Dogu and Agent version not matched!\nThis can result in unexpected behavior.\nDogu: ${process.env.NEXT_PUBLIC_DOGU_VERSION}, Agent: ${version}`}
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
