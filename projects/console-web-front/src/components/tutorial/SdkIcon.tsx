import Image from 'next/image';

import resources from '../../resources/index';
import { GuideSupportSdk } from '../../resources/guide';

interface Props {
  sdk: GuideSupportSdk;
  size: number;
}

const SdkIcon = ({ sdk, size }: Props) => {
  switch (sdk) {
    case GuideSupportSdk.WEBDRIVERIO:
      return <Image src={resources.icons.webdriverio} width={size} height={size} alt="webdriverio" />;
    case GuideSupportSdk.APPIUM:
      return <Image src={resources.icons.appium} width={size} height={size} alt="appium" />;
    case GuideSupportSdk.GAMIUM:
      return <Image src={resources.icons.gamium} width={size} height={size} alt="gamium" />;
    case GuideSupportSdk.SELENIUM:
      return <Image src={resources.icons.selenium} width={size} height={size} alt="selenium" />;
    default:
      return null;
  }
};

export default SdkIcon;
