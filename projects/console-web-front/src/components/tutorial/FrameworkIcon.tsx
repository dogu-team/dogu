import Image from 'next/image';

import resources from '../../resources';
import { TutorialSupportFramework } from '../../resources/tutorials';

interface Props {
  framework: TutorialSupportFramework;
  size: number;
}

const FrameworkIcon = ({ framework, size }: Props) => {
  switch (framework) {
    case TutorialSupportFramework.JEST:
      return <Image src={resources.icons.jest} width={size} height={size} alt="jest" />;
    case TutorialSupportFramework.PYTEST:
      return <Image src={resources.icons.pytest} width={size} height={size} alt="pytest" />;
    default:
      return null;
  }
};

export default FrameworkIcon;
