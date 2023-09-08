import Image from 'next/image';

import resources from '../../resources/index';
import { TutorialSupportSdk } from '../../resources/tutorials';

interface Props {
  sdk: TutorialSupportSdk;
  size: number;
}

const SdkIcon = ({ sdk, size }: Props) => {
  switch (sdk) {
    case TutorialSupportSdk.WEBDRIVERIO:
      return <Image src={resources.icons.webdriverio} width={size} height={size} alt="webdriverio" />;
    case TutorialSupportSdk.APPIUM:
      return <Image src={resources.icons.appium} width={size} height={size} alt="appium" />;
    case TutorialSupportSdk.GAMIUM:
      return <Image src={resources.icons.gamium} width={size} height={size} alt="gamium" />;
    case TutorialSupportSdk.SELENIUM:
      return <Image src={resources.icons.selenium} width={size} height={size} alt="selenium" />;
    default:
      return null;
  }
};

export default SdkIcon;
