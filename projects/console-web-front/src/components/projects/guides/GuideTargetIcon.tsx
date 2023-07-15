import { AppstoreOutlined } from '@ant-design/icons';
import { GoBrowser } from 'react-icons/go';
import { MdGames } from 'react-icons/md';

import { GuideSupportTarget } from '../../../resources/guide';

const GuideTargetIcon = ({ target }: { target: GuideSupportTarget }) => {
  switch (target) {
    case GuideSupportTarget.WEB:
      return <GoBrowser />;
    case GuideSupportTarget.APP:
      return <AppstoreOutlined />;
    case GuideSupportTarget.GAME:
      return <MdGames />;
    default:
      return null;
  }
};

export default GuideTargetIcon;
