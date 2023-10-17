import styled from 'styled-components';
import Image from 'next/image';
import {
  HomeOutlined,
  LockOutlined,
  MenuOutlined,
  PoweroffOutlined,
  RollbackOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import React from 'react';
import { Platform } from '@dogu-private/types';

import { DeviceToolBarMenu } from 'src/utils/streaming/streaming';
import resources from 'src/resources';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  workingPlatforms?: Platform[];
}

const ToolbarButton = ({ workingPlatforms, ...props }: ToolbarButtonProps) => {
  const { device } = useDeviceStreamingContext();

  if (!device || (workingPlatforms && !workingPlatforms.includes(device.platform))) {
    return null;
  }

  return <StyledToolbarButton tabIndex={-1} {...props} />;
};

interface Props {
  handleToolMenuInput: (e: React.MouseEvent<HTMLButtonElement>, menu: DeviceToolBarMenu) => void;
}

const DeviceControlToolbar: React.FC<Props> = ({ handleToolMenuInput }) => {
  return (
    <ToolbarBox>
      {/* volume buttons */}
      <ToolbarButton onClick={(e) => handleToolMenuInput(e, DeviceToolBarMenu.VOLUME_UP)}>
        <Image src={resources.icons.volumeUp} width={32} height={32} alt="volume up" />
      </ToolbarButton>
      <ToolbarButton onClick={(e) => handleToolMenuInput(e, DeviceToolBarMenu.VOLUME_DOWN)}>
        <Image src={resources.icons.volumeDown} width={32} height={32} alt="volume down" />
      </ToolbarButton>
      <ToolbarButton
        workingPlatforms={[Platform.PLATFORM_ANDROID, Platform.PLATFORM_WINDOWS]}
        onClick={(e) => handleToolMenuInput(e, DeviceToolBarMenu.VOLUME_MUTE)}
      >
        <Image src={resources.icons.volumeMute} width={32} height={32} alt="volume mute" />
      </ToolbarButton>

      {/* lock, power buttons */}
      <ToolbarButton
        workingPlatforms={[Platform.PLATFORM_ANDROID]}
        onClick={(e) => {
          handleToolMenuInput(e, DeviceToolBarMenu.LOCK);
        }}
      >
        <LockOutlined width={32} height={32} style={{ fontSize: '20px' }} />
      </ToolbarButton>
      <ToolbarButton
        workingPlatforms={[Platform.PLATFORM_ANDROID]}
        onClick={(e) => {
          handleToolMenuInput(e, DeviceToolBarMenu.UNLOCK);
        }}
      >
        <UnlockOutlined width={32} height={32} style={{ fontSize: '20px' }} />
      </ToolbarButton>
      <ToolbarButton
        workingPlatforms={[Platform.PLATFORM_ANDROID]}
        onClick={(e) => {
          handleToolMenuInput(e, DeviceToolBarMenu.POWER);
        }}
      >
        <PoweroffOutlined width={32} height={32} style={{ fontSize: '20px' }} />
      </ToolbarButton>

      {/* screenshot button */}
      <ToolbarButton
        workingPlatforms={[Platform.PLATFORM_ANDROID]}
        onClick={(e) => {
          handleToolMenuInput(e, DeviceToolBarMenu.SCREENSHOT);
        }}
      >
        <Image src={resources.icons.screenshot} width={32} height={32} alt="screen shot" />
      </ToolbarButton>

      <Divider />

      {/* back, home, switch buttons */}

      <ToolbarButton
        workingPlatforms={[Platform.PLATFORM_ANDROID]}
        onClick={(e) => {
          handleToolMenuInput(e, DeviceToolBarMenu.BACK);
        }}
      >
        <RollbackOutlined width={32} height={32} style={{ fontSize: '20px' }} />
      </ToolbarButton>
      <ToolbarButton
        workingPlatforms={[Platform.PLATFORM_ANDROID, Platform.PLATFORM_IOS]}
        onClick={(e) => {
          handleToolMenuInput(e, DeviceToolBarMenu.HOME);
        }}
      >
        <HomeOutlined width={32} height={32} style={{ fontSize: '20px' }} />
      </ToolbarButton>
      <ToolbarButton
        workingPlatforms={[Platform.PLATFORM_ANDROID]}
        onClick={(e) => {
          handleToolMenuInput(e, DeviceToolBarMenu.SWITCH);
        }}
      >
        <MenuOutlined width={32} height={32} style={{ fontSize: '20px', transform: 'rotate(90deg)' }} />
      </ToolbarButton>
    </ToolbarBox>
  );
};

export default React.memo(DeviceControlToolbar);

const ToolbarBox = styled.div`
  display: flex;
  width: 40px;
  padding: 4px;
  background-color: ${(props) => props.theme.colors.gray3};
  border-radius: 0 4px 4px 0;
  flex-direction: column;
  align-items: center;
`;

const StyledToolbarButton = styled.button`
  background-color: inherit;
  width: 32px;
  height: 32px;
  margin: 2px 0;

  &:hover {
    background-color: ${(props) => props.theme.colors.gray4};
  }
`;

const Divider = styled.hr`
  display: block;
  width: 100%;
  height: 0;
  margin: 8px 0;
  border-bottom: 2px dashed ${(props) => props.theme.colors.gray6};
`;
