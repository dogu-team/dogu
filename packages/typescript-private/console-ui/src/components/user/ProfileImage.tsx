import { Avatar, AvatarProps } from 'antd';
import styled from 'styled-components';

interface Props extends AvatarProps {
  profileImageUrl: string | null;
  name: string;
}

const ProfileImage = ({ profileImageUrl, name, ...props }: Props) => {
  return (
    <StyledAvartar {...props} src={profileImageUrl ?? undefined} style={{ backgroundColor: '#cdcdcd', fontSize: '0.9rem', flexShrink: 0, ...props.style }}>
      {name.charAt(0).toUpperCase()}
    </StyledAvartar>
  );
};

export default ProfileImage;

const StyledAvartar = styled(Avatar)`
  display: flex;
  align-items: center;
  justify-content: center;

  & > span {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1.4 !important;
  }
`;
