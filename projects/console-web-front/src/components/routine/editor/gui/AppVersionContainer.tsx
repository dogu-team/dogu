import { Platform, PlatformType } from '@dogu-private/types';
import { AppVersion } from '@dogu-tech/action-common';
import { Button } from 'antd';
import { useState } from 'react';

import PlatformIcon from '../../../device/PlatformIcon';
import PlatformAppVersionSelector from './PlatformAppVersionSelector';

interface ItemProps {
  platform: PlatformType;
  version: string | undefined;
  onReset: (platform: PlatformType) => void;
  onChange: (platform: PlatformType, version: string | undefined) => void;
}

const AppVersionItem = ({ platform, version, onReset, onChange }: ItemProps) => {
  const [open, setOpen] = useState(!!version);

  return open ? (
    <PlatformAppVersionSelector key={platform} version={version} platform={platform} onReset={onReset} onChange={onChange} />
  ) : (
    <Button
      key={platform}
      onClick={() => {
        setOpen(true);
      }}
      style={{ display: 'inline-flex', alignItems: 'center', borderStyle: 'dashed', marginRight: '.25rem' }}
    >
      Add&nbsp;
      <PlatformIcon platform={platform === 'android' ? Platform.PLATFORM_ANDROID : Platform.PLATFORM_IOS} />
      &nbsp;App version
    </Button>
  );
};

interface Props {
  appVersion: AppVersion;
  onUpdate: (platform: PlatformType, version: string | undefined) => void;
  onClose: (platform: PlatformType) => void;
}

const AppVersionContainer = ({ appVersion, onUpdate, onClose }: Props) => {
  if (typeof appVersion === 'string' || typeof appVersion === 'number') {
    return <p>{appVersion}</p>;
  }

  const platforms: PlatformType[] = ['android', 'ios'];

  return (
    <div>
      {platforms.map((platform) => {
        return <AppVersionItem key={platform} platform={platform} version={appVersion?.[platform]} onReset={onClose} onChange={onUpdate} />;
      })}
    </div>
  );
};

export default AppVersionContainer;
