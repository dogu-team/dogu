import { Tag } from 'antd';

interface Props {
  style?: React.CSSProperties;
}

const OrganizationApplicationLatestTag = ({ style }: Props) => {
  return (
    <Tag style={style} color="magenta">
      Latest
    </Tag>
  );
};

export default OrganizationApplicationLatestTag;
