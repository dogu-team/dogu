import { PROJECT_TYPE } from '@dogu-private/types';
import { GoBrowser } from 'react-icons/go';
import { LiaToolsSolid } from 'react-icons/lia';
import { MobileOutlined } from '@ant-design/icons';
import Image from 'next/image';

import resources from '../../resources';

interface Props {
  type: PROJECT_TYPE;
  style?: React.CSSProperties;
}

const ProjectTypeIcon = ({ type, style }: Props) => {
  switch (type) {
    case PROJECT_TYPE.CUSTOM:
      return <LiaToolsSolid style={style} />;
    case PROJECT_TYPE.WEB:
      return <GoBrowser style={style} />;
    case PROJECT_TYPE.APP:
      return <MobileOutlined style={style} />;
    case PROJECT_TYPE.GAME:
      return (
        <span style={{ display: 'inline-flex', position: 'relative', width: '1rem', height: '1rem', ...style }}>
          <Image src={resources.icons.mobileGame} fill alt="mobile-game" />
        </span>
      );
    default:
      return null;
  }
};

export default ProjectTypeIcon;
