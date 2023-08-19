import { Tag } from 'antd';

interface Props {
  style?: React.CSSProperties;
}

const ProTag = ({ style }: Props) => {
  return (
    <Tag color="cyan-inverse" style={{ margin: 0, ...style }}>
      Pro ✨
    </Tag>
  );
};

export default ProTag;
