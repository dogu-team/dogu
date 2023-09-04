import { AppstoreOutlined } from '@ant-design/icons';
import { GoBrowser } from 'react-icons/go';
import { SiUnity } from 'react-icons/si';

import { TutorialSupportTarget } from '../../resources/tutorials';

const TargetIcon = ({ target }: { target: TutorialSupportTarget }) => {
  switch (target) {
    case TutorialSupportTarget.WEB:
      return <GoBrowser />;
    case TutorialSupportTarget.APP:
      return <AppstoreOutlined />;
    case TutorialSupportTarget.UNITY:
      return <SiUnity />;
    default:
      return null;
  }
};

export default TargetIcon;
