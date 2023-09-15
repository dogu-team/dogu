import { Tag } from 'antd';

interface Props {
  style?: React.CSSProperties;
}

const ProjectApplicationLatestTag = ({ style }: Props) => {
  return (
    <Tag style={style} color="magenta">
      Latest
    </Tag>
  );
};

export default ProjectApplicationLatestTag;
