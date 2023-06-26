import styled from 'styled-components';
import Image from 'next/image';
import React from 'react';
import { HomeOutlined, LockOutlined, MenuOutlined, PoweroffOutlined, RollbackOutlined, UnlockOutlined } from '@ant-design/icons';

import { DeviceToolBarMenu } from 'src/utils/streaming/streaming';
import resources from 'src/resources';

interface Props {
  onClickMenu: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, menu: DeviceToolBarMenu) => Promise<any>;
}

const DeviceToolbar = ({ onClickMenu }: Props) => {
  return (
    <ToolbarBox>
      <StyledToolbarButton
        onClick={(event) => {
          onClickMenu(event, DeviceToolBarMenu.VOLUME_UP);
        }}
        tabIndex={-1}
      >
        <Image src={resources.icons.volumeUp} width={32} height={32} alt="volume up" />
      </StyledToolbarButton>
      <StyledToolbarButton
        onClick={(event) => {
          onClickMenu(event, DeviceToolBarMenu.VOLUME_DOWN);
        }}
        tabIndex={-1}
      >
        <Image src={resources.icons.volumeDown} width={32} height={32} alt="volume down" />
      </StyledToolbarButton>
      <StyledToolbarButton
        onClick={(event) => {
          onClickMenu(event, DeviceToolBarMenu.VOLUME_MUTE);
        }}
        tabIndex={-1}
      >
        <Image src={resources.icons.volumeMute} width={32} height={32} alt="volume mute" />
      </StyledToolbarButton>
      <StyledToolbarButton
        onClick={(event) => {
          onClickMenu(event, DeviceToolBarMenu.LOCK);
        }}
        tabIndex={-1}
      >
        <LockOutlined width={32} height={32} style={{ fontSize: '20px' }} />
      </StyledToolbarButton>
      <StyledToolbarButton
        onClick={(event) => {
          onClickMenu(event, DeviceToolBarMenu.UNLOCK);
        }}
        tabIndex={-1}
      >
        <UnlockOutlined width={32} height={32} style={{ fontSize: '20px' }} />
      </StyledToolbarButton>
      <StyledToolbarButton
        onClick={(event) => {
          onClickMenu(event, DeviceToolBarMenu.POWER);
        }}
        tabIndex={-1}
      >
        <PoweroffOutlined width={32} height={32} style={{ fontSize: '20px' }} />
      </StyledToolbarButton>

      <StyledToolbarButton
        onClick={(event) => {
          onClickMenu(event, DeviceToolBarMenu.SCREENSHOT);
        }}
        tabIndex={-1}
      >
        <Image src={resources.icons.screenshot} width={32} height={32} alt="screen shot" />
      </StyledToolbarButton>

      <Divider />

      <StyledToolbarButton
        onClick={(event) => {
          onClickMenu(event, DeviceToolBarMenu.BACK);
        }}
        tabIndex={-1}
      >
        <RollbackOutlined width={32} height={32} style={{ fontSize: '20px' }} />
      </StyledToolbarButton>
      <StyledToolbarButton
        onClick={(event) => {
          onClickMenu(event, DeviceToolBarMenu.HOME);
        }}
        tabIndex={-1}
      >
        <HomeOutlined width={32} height={32} style={{ fontSize: '20px' }} />
      </StyledToolbarButton>
      <StyledToolbarButton
        onClick={(event) => {
          onClickMenu(event, DeviceToolBarMenu.SWITCH);
        }}
        tabIndex={-1}
      >
        <MenuOutlined width={32} height={32} style={{ fontSize: '20px', transform: 'rotate(90deg)' }} />
      </StyledToolbarButton>
    </ToolbarBox>
  );
};

export default React.memo(DeviceToolbar);

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
