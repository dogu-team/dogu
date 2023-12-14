import { ArrowRightOutlined } from '@ant-design/icons';
import useLicenseStore from '../../stores/license';

interface Props {
  maxParallel: number;
}

const AutomationParallelCounter: React.FC<Props> = ({ maxParallel }) => {
  return (
    <div style={{ lineHeight: '1.5', fontSize: '.8rem', color: '#222' }}>
      Cloud device max parallel tests: {maxParallel}
    </div>
  );
};

export const WebTestAutomationParallelCounter: React.FC = () => {
  const license = useLicenseStore((state) => state.license);

  if (!license) {
    return null;
  }

  return <AutomationParallelCounter maxParallel={license.webTestAutomationParallelCount} />;
};

export const MobileGameTestAutomationParallelCounter: React.FC = () => {
  const license = useLicenseStore((state) => state.license);

  if (!license) {
    return null;
  }

  return <AutomationParallelCounter maxParallel={license.mobileGameTestAutomationParallelCount} />;
};

export const MobileAppTestAutomationParallelCounter: React.FC = () => {
  const license = useLicenseStore((state) => state.license);

  if (!license) {
    return null;
  }

  return <AutomationParallelCounter maxParallel={license.mobileAppTestAutomationParallelCount} />;
};
