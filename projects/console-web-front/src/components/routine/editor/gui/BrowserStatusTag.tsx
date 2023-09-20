import { Tag } from 'antd';

interface Props {
  status: string | undefined;
}

const BrowserStatusTag: React.FC<Props> = ({ status }) => {
  if (!status) {
    return null;
  }

  const colorMap = {
    latest: 'blue',
    dev: 'purple',
    canary: 'orange',
  };

  return (
    <Tag color={colorMap[status as keyof typeof colorMap] ?? 'red'} style={{ margin: '0 0.25rem' }}>
      {status}
    </Tag>
  );
};

export default BrowserStatusTag;
