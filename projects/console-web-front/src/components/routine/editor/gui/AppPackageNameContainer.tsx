import { CloseOutlined } from '@ant-design/icons';
import { Platform, PlatformType } from '@dogu-private/types';
import { AppPackageName } from '@dogu-tech/action-common';
import { Button } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../../../styles/box';
import PlatformIcon from '../../../device/PlatformIcon';
import PlatformAppPcakageNameSelector from './PlatformAppPackagenNameSelector';

interface ItemProps {
  platform: PlatformType;
  packageName: string | undefined;
  onReset: (platform: PlatformType) => void;
  onChange: (platform: PlatformType, version: string | undefined) => void;
  onClickButton: (platform: PlatformType) => void;
}

const AppPackageNameItem = ({ platform, packageName, onReset, onChange, onClickButton }: ItemProps) => {
  const [open, setOpen] = useState(!!packageName);

  return open ? (
    <FlexRow>
      <PlatformAppPcakageNameSelector
        key={platform}
        packageName={packageName}
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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderStyle: 'dashed',
        marginRight: '.25rem',
      }}
    >
      <PlatformIcon platform={platform === 'android' ? Platform.PLATFORM_ANDROID : Platform.PLATFORM_IOS} />
      &nbsp;Select app
    </Button>
  );
};

interface Props {
  appPackageName: AppPackageName;
  onUpdate: (platform: PlatformType, version: string | undefined) => void;
  onClose: (platform: PlatformType) => void;
}

const AppPackageNameContainer = ({ appPackageName, onUpdate, onClose }: Props) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>();

  const handleClose = (platform: PlatformType) => {
    setSelectedPlatform(undefined);
    onClose(platform);
  };

  if (typeof appPackageName === 'string' || typeof appPackageName === 'number') {
    return <p>{appPackageName}</p>;
  }

  const platforms: PlatformType[] = ['android', 'ios'];

  if (!!appPackageName && typeof appPackageName === 'object' && Object.keys(appPackageName).length > 0) {
    return (
      <div>
        {Object.keys(appPackageName).map((platform) => {
          return (
            <AppPackageNameItem
              key={platform}
              platform={platform as PlatformType}
              packageName={appPackageName?.[platform as PlatformType]}
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
        <AppPackageNameItem
          key={selectedPlatform}
          platform={selectedPlatform}
          packageName={appPackageName?.[selectedPlatform]}
          onReset={handleClose}
          onChange={onUpdate}
          onClickButton={setSelectedPlatform}
        />
      ) : (
        platforms.map((platform) => {
          return (
            <AppPackageNameItem
              key={platform}
              platform={platform}
              packageName={appPackageName?.[platform]}
              onReset={handleClose}
              onChange={onUpdate}
              onClickButton={setSelectedPlatform}
            />
          );
        })
      )}
    </div>
  );
};

export default AppPackageNameContainer;

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
