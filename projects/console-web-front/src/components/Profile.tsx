import styled from 'styled-components';
import ProfileImage from './ProfileImage';

interface Props {
  name: string;
  desc?: string;
  profileImageUrl?: string | null;
  showProfileImage?: boolean;
}

const Profile = ({ name, desc, profileImageUrl, showProfileImage = true }: Props) => {
  return (
    <Box>
      {showProfileImage && <ProfileImage profileImageUrl={profileImageUrl ?? null} name={name} size={40} />}
      <TextWrapper>
        <Name>{name}</Name>
        {desc && <Description>{desc}</Description>}
      </TextWrapper>
    </Box>
  );
};

export default Profile;

const Box = styled.div`
  display: flex;
  align-items: center;
`;

const TextWrapper = styled.div`
  margin-left: 0.75rem;
`;

const Name = styled.p`
  font-weight: 500;
  text-align: left;
  line-height: 1.5;
`;

const Description = styled.p`
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.gray4};
  text-align: left;
  line-height: 1.5;
`;
