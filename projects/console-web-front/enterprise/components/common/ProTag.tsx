import { WarningOutlined } from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';

interface Props {
  style?: React.CSSProperties;
  warnging?: boolean;
  warningMessage?: React.ReactNode;
}

const ProTag = ({ style, warnging, warningMessage }: Props) => {
  return (
    <Tooltip title={warningMessage} open={warningMessage ? undefined : false}>
      <Tag
        color={warnging ? 'yellow-inverse' : 'cyan-inverse'}
        icon={warnging ? <WarningOutlined style={{ color: 'red' }} /> : undefined}
        style={{ margin: 0, ...style }}
      >
        Pro ✨
      </Tag>
    </Tooltip>
  );
};

export default ProTag;
