import Image from 'next/image';

import resources from '../../resources';
import { GuideSupportFramework } from '../../resources/guide';

interface Props {
  framework: GuideSupportFramework;
  size: number;
}

const FrameworkIcon = ({ framework, size }: Props) => {
  switch (framework) {
    case GuideSupportFramework.JEST:
      return <Image src={resources.icons.jest} width={size} height={size} alt="jest" />;
    case GuideSupportFramework.PYTEST:
      return <Image src={resources.icons.pytest} width={size} height={size} alt="pytest" />;
    default:
      return null;
  }
};

export default FrameworkIcon;
