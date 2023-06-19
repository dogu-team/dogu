import styled from 'styled-components';

interface Props {
  profileImage: React.ReactNode;
  name: React.ReactNode;
}

const ProfileImageWithName = ({ profileImage, name }: Props) => {
  return (
    <Box>
      {profileImage}
      <Name>{name}</Name>
    </Box>
  );
};

export default ProfileImageWithName;

const Box = styled.div`
  display: flex;
  align-items: center;
`;

const Name = styled.div`
  margin-left: 0.5rem;
`;
