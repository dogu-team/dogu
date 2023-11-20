import styled from 'styled-components';
import { DownloadOutlined, HomeOutlined, MenuOutlined, RollbackOutlined, SettingOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { Platform } from '@dogu-private/types';
import { Divider } from 'antd';
import { MdGpsFixed, MdOutlineDevicesFold } from 'react-icons/md';
import { HiLanguage } from 'react-icons/hi2';
import { RiBookOpenLine } from 'react-icons/ri';

import { DeviceToolBarMenu } from 'src/utils/streaming/streaming';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import useDeviceInput from '../../hooks/streaming/useDeviceInput';
import ApplicationUploader from './ApplicationUploader';
import DeviceHelperButtonGroup from './DeviceHelperButtonGroup';
import DeviceLanguageChanger from './DeviceLanguageChanger';
import DeviceLocationChanger from './DeviceLocationChanger';
import ToolbarButton from './ToolbarButton';

const FoldButton: React.FC = () => {
  const { deviceService, device } = useDeviceStreamingContext();
  const [isFolded, setIsFolded] = useState(false);
  const [isFoldable, setIsFoldable] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!device?.serial || !deviceService) {
        return;
      }

      try {
        const rv = await deviceService.deviceClientRef.current?.getFoldStatus(device.serial);
        setIsFolded(rv?.isFolded ?? false);
        setIsFoldable(rv?.isFoldable ?? false);
      } catch (e) {
        console.debug('Failed to get fold state', e);
      }
    })();
  }, [device?.serial, deviceService]);

  if (!device || !deviceService || !isFoldable) {
    return null;
  }

  const handleFold = async () => {
    setLoading(true);
    try {
      await deviceService.deviceClientRef.current?.fold(device.serial, true);
      setIsFolded(true);
    } catch (e) {
      console.debug('Fold failed', e);
    }
    setLoading(false);
  };

  const handleUnfold = async () => {
    setLoading(true);
    try {
      await deviceService.deviceClientRef.current?.fold(device.serial, false);
      setIsFolded(false);
    } catch (e) {
      console.debug('Unfold failed', e);
    }
    setLoading(false);
  };

  return (
    <ToolbarButton
      workingPlatforms={[Platform.PLATFORM_ANDROID]}
      icon={isFolded ? <RiBookOpenLine /> : <MdOutlineDevicesFold />}
      text={isFolded ? 'Unfold' : 'Fold'}
      onClick={isFolded ? handleUnfold : handleFold}
      destroyTooltipOnHide
      tooltipTitle="Fold & Unfold"
      disabled={isLoading}
    />
  );
};

interface Props {}

const DeviceControlToolbar: React.FC<Props> = () => {
  const { deviceRTCCaller, device, isCloudDevice } = useDeviceStreamingContext();
  const { handleToolMenuInput } = useDeviceInput(
    deviceRTCCaller ?? undefined,
    device?.platform ?? Platform.PLATFORM_UNSPECIFIED,
  );

  return (
    <ToolbarBox>
      <TitleWrapper>
        <Title>Menu</Title>
      </TitleWrapper>

      <ToolbarButton
        workingPlatforms={[Platform.PLATFORM_ANDROID, Platform.PLATFORM_IOS]}
        icon={<DownloadOutlined />}
        text="Install app"
        tooltipTitle="Install application"
        content={
          <div>
            <ApplicationUploader />
          </div>
        }
      />

      <ToolbarButton
        workingPlatforms={[Platform.PLATFORM_ANDROID]}
        icon={<HiLanguage />}
        text="Language"
        content={<DeviceLanguageChanger />}
        destroyTooltipOnHide
        tooltipTitle="Change device language"
      />

      {isCloudDevice && (
        <ToolbarButton
          workingPlatforms={[Platform.PLATFORM_ANDROID, Platform.PLATFORM_IOS]}
          icon={<MdGpsFixed />}
          text="Location"
          content={<DeviceLocationChanger />}
          tooltipStyle={{ width: '320px' }}
          tooltipTitle="Change device location"
          destroyTooltipOnHide
        />
      )}

      <Divider style={{ margin: '.8rem 0' }} />

      <FoldButton />

      <ToolbarButton
        workingPlatforms={[Platform.PLATFORM_ANDROID]}
        onClick={(e) => {
          handleToolMenuInput(e, DeviceToolBarMenu.BACK);
        }}
        icon={<RollbackOutlined />}
        text="Back"
      />
      <ToolbarButton
        workingPlatforms={[Platform.PLATFORM_ANDROID, Platform.PLATFORM_IOS]}
        onClick={(e) => {
          handleToolMenuInput(e, DeviceToolBarMenu.HOME);
        }}
        icon={<HomeOutlined />}
        text="Home"
      />
      <ToolbarButton
        workingPlatforms={[Platform.PLATFORM_ANDROID]}
        onClick={(e) => {
          handleToolMenuInput(e, DeviceToolBarMenu.SWITCH);
        }}
        icon={<MenuOutlined style={{ transform: 'rotate(90deg)' }} />}
        text="Switch"
      />

      <Divider style={{ margin: '.8rem 0' }} />

      <ToolbarButton
        workingPlatforms={[Platform.PLATFORM_ANDROID]}
        icon={<SettingOutlined />}
        text="Advanced"
        content={
          <div>
            <DeviceHelperButtonGroup />
          </div>
        }
      />
    </ToolbarBox>
  );
};

export default React.memo(DeviceControlToolbar);

const ToolbarBox = styled.div``;

const TitleWrapper = styled.div`
  background-color: #f4f4f4;
  padding: 0.25rem 1rem;
`;

const Title = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.5;
`;
