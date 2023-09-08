import Image from 'next/image';

import resources from '../../resources/index';
import { TutorialSupportSdk } from '../../resources/tutorials';

interface Props {
  sdk: TutorialSupportSdk;
  size: number;
}

const SdkIcon = ({ sdk, size }: Props) => {
  const imageStyle: React.CSSProperties = {
    margin: '0 0.35rem',
  };

  switch (sdk) {
    case TutorialSupportSdk.WEBDRIVERIO:
      return <Image src={resources.icons.webdriverio} width={size} height={size} style={imageStyle} alt="webdriverio" />;
    case TutorialSupportSdk.APPIUM:
      return <Image src={resources.icons.appium} width={size} height={size} style={imageStyle} alt="appium" />;
    case TutorialSupportSdk.GAMIUM:
      return <Image src={resources.icons.gamium} width={size} height={size} style={imageStyle} alt="gamium" />;
    case TutorialSupportSdk.SELENIUM:
      return <Image src={resources.icons.selenium} width={size} height={size} style={imageStyle} alt="selenium" />;
    default:
      return null;
  }
};

export default SdkIcon;
