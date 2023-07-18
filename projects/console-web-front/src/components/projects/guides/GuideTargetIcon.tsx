import { AppstoreOutlined } from '@ant-design/icons';
import { GoBrowser } from 'react-icons/go';
import { SiUnity } from 'react-icons/si';

import { GuideSupportTarget } from '../../../resources/guide';

const GuideTargetIcon = ({ target }: { target: GuideSupportTarget }) => {
  switch (target) {
    case GuideSupportTarget.WEB:
      return <GoBrowser />;
    case GuideSupportTarget.APP:
      return <AppstoreOutlined />;
    case GuideSupportTarget.UNITY:
      return <SiUnity />;
    default:
      return null;
  }
};

export default GuideTargetIcon;
