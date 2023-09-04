import Image from 'next/image';

import resources from '../../resources/index';
import { TutorialSupportLanguage } from '../../resources/tutorials';

interface Props {
  language: TutorialSupportLanguage;
  size: number;
}

const LanguageIcon = ({ language, size }: Props) => {
  switch (language) {
    case TutorialSupportLanguage.PYTHON:
      return <Image src={resources.icons.python} width={size} height={size} alt={language} />;
    case TutorialSupportLanguage.JAVASCRIPT:
      return <Image src={resources.icons.javascript} width={size} height={size} alt={language} />;
    case TutorialSupportLanguage.TYPESCRIPT:
      return <Image src={resources.icons.typescript} width={size} height={size} alt={language} />;
    default:
      return null;
  }
};

export default LanguageIcon;
