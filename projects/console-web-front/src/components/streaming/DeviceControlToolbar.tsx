import styled from 'styled-components';
import {
  DownloadOutlined,
  HomeOutlined,
  MenuOutlined,
  RightOutlined,
  RollbackOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import React from 'react';
import { Platform } from '@dogu-private/types';
import { Divider, Tooltip } from 'antd';
import { MdGpsFixed } from 'react-icons/md';
import { HiLanguage } from 'react-icons/hi2';

import { DeviceToolBarMenu } from 'src/utils/streaming/streaming';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import useDeviceInput from '../../hooks/streaming/useDeviceInput';
import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../styles/box';
import ApplicationUploader from './ApplicationUploader';
import DeviceHelperButtonGroup from './DeviceHelperButtonGroup';
import DeviceLanguageChanger from './DeviceLanguageChanger';
import DeviceLocationChanger from './DeviceLocationChanger';

interface ToolbarButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  workingPlatforms?: Platform[];
  icon: React.ReactNode;
  text: React.ReactNode;
  content?: React.ReactNode;
  destroyTooltipOnHide?: boolean;
  tooltipTitle?: React.ReactNode;
  tooltipStyle?: React.CSSProperties;
}

const ToolbarButton = ({
  workingPlatforms,
  icon,
  text,
  content,
  destroyTooltipOnHide,
  tooltipStyle,
  tooltipTitle,
  ...props
}: ToolbarButtonProps) => {
  const { device } = useDeviceStreamingContext();
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  if (!device || (workingPlatforms && !workingPlatforms.includes(device.platform))) {
    return null;
  }

  return (
    <Tooltip
      trigger="click"
      ref={tooltipRef}
      open={!!content ? undefined : false}
      placement="rightTop"
      title={
        <div style={{ color: '#000' }}>
          <p style={{ fontSize: '.8rem', fontWeight: '600', marginBottom: '.25rem', lineHeight: '1.5' }}>
            {tooltipTitle}
          </p>
          {content}
        </div>
      }
      color="#fff"
      destroyTooltipOnHide={destroyTooltipOnHide}
      overlayInnerStyle={tooltipStyle}
    >
      <StyledToolbarButton tabIndex={-1} {...props}>
        <SpaceBetween>
          <FlexBox style={{ marginRight: '.5rem' }}>
            <FlexBox style={{ marginRight: '.5rem' }}>{icon}</FlexBox>
            <p>{text}</p>
          </FlexBox>
          {!!content && (
            <FlexBox>
              <RightOutlined />
            </FlexBox>
          )}
        </SpaceBetween>
      </StyledToolbarButton>
    </Tooltip>
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

      {isCloudDevice && (
        <ToolbarButton
          workingPlatforms={[Platform.PLATFORM_ANDROID]}
          icon={<HiLanguage />}
          text="Language"
          content={<DeviceLanguageChanger />}
          destroyTooltipOnHide
          tooltipTitle="Change device language"
        />
      )}

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

const StyledToolbarButton = styled.button`
  display: flex;
  width: 100%;
  height: 3rem;
  padding: 0 1rem;
  background-color: #fff;
  align-items: center;

  &:hover {
    background-color: ${(props) => props.theme.colors.gray2};
  }

  p {
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const FlexBox = styled.div`
  ${flexRowBaseStyle}
`;

const SpaceBetween = styled.div`
  width: 100%;
  ${flexRowSpaceBetweenStyle}
`;
