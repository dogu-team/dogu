import { Avatar, AvatarProps } from 'antd';
import Image from 'next/image';
import React, { forwardRef, useRef } from 'react';
import styled from 'styled-components';
import { flexRowCenteredStyle } from '../styles/box';

interface Props extends AvatarProps {
  profileImageUrl: string | null | undefined;
  name: string | undefined;
}

const ProfileImage = forwardRef<HTMLImageElement, Props>(({ profileImageUrl, name, ...props }, forwaredRef) => {
  return (
    <StyledAvartar
      {...props}
      src={profileImageUrl ? <StyledImage ref={forwaredRef} src={profileImageUrl} fill sizes="128px" alt={name ?? ''} priority /> : undefined}
      style={{ backgroundColor: '#cdcdcd', fontSize: '0.9rem', flexShrink: 0, ...props.style }}
    >
      {name?.charAt(0).toUpperCase()}
    </StyledAvartar>
  );
});

ProfileImage.displayName = 'ProfileImage';

export default React.memo(ProfileImage);

const StyledAvartar = styled(Avatar)`
  ${flexRowCenteredStyle}

  & > span {
    ${flexRowCenteredStyle}
    line-height: 1.4 !important;
    font-weight: 400 !important;
  }
`;

const StyledImage = styled(Image)``;
