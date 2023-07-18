import Image from 'next/image';
import resources from '../../resources';
import { GuideSupportLanguage } from '../../resources/guide';

interface Props {
  language: GuideSupportLanguage;
  size: number;
}

const LanguageImage = ({ language, size }: Props) => {
  switch (language) {
    case GuideSupportLanguage.PYTHON:
      return <Image src={resources.icons.python} width={size} height={size} alt={language} />;
    case GuideSupportLanguage.JAVASCRIPT:
      return <Image src={resources.icons.javascript} width={size} height={size} alt={language} />;
    case GuideSupportLanguage.TYPESCRIPT:
      return <Image src={resources.icons.typescript} width={size} height={size} alt={language} />;
    default:
      return null;
  }
};

export default LanguageImage;
