import { PROJECT_TYPE } from '@dogu-private/types';
import { MdWeb, MdOutlineGamepad } from 'react-icons/md';
import { LiaToolsSolid } from 'react-icons/lia';
import { MobileOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

interface Props {
  type: PROJECT_TYPE;
  style?: React.CSSProperties;
}

const ProjectTypeIcon = ({ type, style }: Props) => {
  switch (type) {
    case PROJECT_TYPE.CUSTOM:
      return <LiaToolsSolid style={style} />;
    case PROJECT_TYPE.WEB:
      return <MdWeb style={style} />;
    case PROJECT_TYPE.APP:
      return <MobileOutlined style={style} />;
    case PROJECT_TYPE.GAME:
      return <MdOutlineGamepad style={style} />;
    default:
      return null;
  }
};

export default ProjectTypeIcon;
