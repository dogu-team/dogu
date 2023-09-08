import { TutorialSupportPlatform } from '../../resources/tutorials';

import AndroidIcon from 'public/resources/icons/platforms/android.svg';
import MacIcon from 'public/resources/icons/platforms/mac.svg';
import IosIcon from 'public/resources/icons/platforms/ios.svg';
import WindowsIcon from 'public/resources/icons/platforms/windows.svg';

const PlatformIcon = ({ platform }: { platform: TutorialSupportPlatform }) => {
  switch (platform) {
    case TutorialSupportPlatform.ANDROID:
      return <AndroidIcon width={20} height={20} icon-id="android-icon" />;
    case TutorialSupportPlatform.IOS:
      return <IosIcon width={20} height={20} icon-id="ios-icon" />;
    case TutorialSupportPlatform.MACOS:
      return <MacIcon width={20} height={20} icon-id="mac-icon" />;
    case TutorialSupportPlatform.WINDOWS:
      return <WindowsIcon width={20} height={20} icon-id="windows-icon" />;
    default:
      return null;
  }
};

export default PlatformIcon;
