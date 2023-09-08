import { CloseOutlined } from '@ant-design/icons';
import { Platform, PlatformType } from '@dogu-private/types';
import { AppVersion } from '@dogu-tech/action-common';
import { Button } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';
import { flexRowBaseStyle } from '../../../../styles/box';

import PlatformIcon from '../../../device/PlatformIcon';
import PlatformAppVersionSelector from './PlatformAppVersionSelector';

interface ItemProps {
  platform: PlatformType;
  version: string | undefined;
  onReset: (platform: PlatformType) => void;
  onChange: (platform: PlatformType, version: string | undefined) => void;
  onClickButton: (platform: PlatformType) => void;
}

const AppVersionItem = ({ platform, version, onReset, onChange, onClickButton }: ItemProps) => {
  const [open, setOpen] = useState(!!version);

  return open ? (
    <FlexRow>
      <PlatformAppVersionSelector
        key={platform}
        version={version}
        platform={platform}
        onReset={(platform) => {
          onReset(platform);
          setOpen(false);
        }}
        onChange={(platform, version) => {
          if (!version) {
            onReset(platform);
            return;
          }
          onChange(platform, version);
        }}
      />
      <CloseButton
        onClick={() => {
          onReset(platform);
          setOpen(false);
        }}
      >
        <CloseOutlined />
      </CloseButton>
    </FlexRow>
  ) : (
    <Button
      key={platform}
      onClick={() => {
        setOpen(true);
        onClickButton(platform);
      }}
      style={{ display: 'inline-flex', alignItems: 'center', borderStyle: 'dashed', marginRight: '.25rem' }}
    >
      <PlatformIcon platform={platform === 'android' ? Platform.PLATFORM_ANDROID : Platform.PLATFORM_IOS} />
      &nbsp;Select app version
    </Button>
  );
};

interface Props {
  appVersion: AppVersion;
  onUpdate: (platform: PlatformType, version: string | undefined) => void;
  onClose: (platform: PlatformType) => void;
}

const AppVersionContainer = ({ appVersion, onUpdate, onClose }: Props) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>();

  const handleClose = (platform: PlatformType) => {
    setSelectedPlatform(undefined);
    onClose(platform);
  };

  if (typeof appVersion === 'string' || typeof appVersion === 'number') {
    return <p>{appVersion}</p>;
  }

  const platforms: PlatformType[] = ['android', 'ios'];

  if (!!appVersion && typeof appVersion === 'object' && Object.keys(appVersion).length > 0) {
    return (
      <div>
        {Object.keys(appVersion).map((platform) => {
          return (
            <AppVersionItem
              key={platform}
              platform={platform as PlatformType}
              version={appVersion?.[platform as PlatformType]}
              onReset={handleClose}
              onChange={onUpdate}
              onClickButton={setSelectedPlatform}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {selectedPlatform ? (
        <AppVersionItem
          key={selectedPlatform}
          platform={selectedPlatform}
          version={appVersion?.[selectedPlatform]}
          onReset={handleClose}
          onChange={onUpdate}
          onClickButton={setSelectedPlatform}
        />
      ) : (
        platforms.map((platform) => {
          return (
            <AppVersionItem key={platform} platform={platform} version={appVersion?.[platform]} onReset={handleClose} onChange={onUpdate} onClickButton={setSelectedPlatform} />
          );
        })
      )}
    </div>
  );
};

export default AppVersionContainer;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const CloseButton = styled.button`
  padding: 0.25rem;
  margin-left: 0.25rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
`;
