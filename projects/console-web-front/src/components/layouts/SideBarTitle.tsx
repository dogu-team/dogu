import Link from 'next/link';
import styled from 'styled-components';

import ProfileImage from 'src/components/ProfileImage';
import useEventStore from 'src/stores/events';

interface Props {
  href: string;
  subTitle: string;
  profileImageUrl: string | null;
  name: string;
  accessId?: string;
}

const SideBarTitle = ({ href, subTitle, name, profileImageUrl, accessId }: Props) => {
  const fireEvent = useEventStore((state) => state.fireEvent);

  return (
    <Box>
      {/* <SubTitle>{subTitle}</SubTitle> */}
      <StyledLink>
        <Title>
          <ProfileImageWrapper>
            <ProfileImage shape="square" size={28} name={name} profileImageUrl={profileImageUrl} />
          </ProfileImageWrapper>
          <p access-id={accessId}>{name}</p>
        </Title>
      </StyledLink>
    </Box>
  );
};

export default SideBarTitle;

const Box = styled.div`
  width: 100%;
  transition: all 0.2s;
`;

const SubTitle = styled.p`
  font-size: 0.8rem;
  padding: 0 16px;
  margin-bottom: 0.25rem;
  color: ${(props) => props.theme.colors.gray6};
`;

// const StyledLink = styled(Link)`
const StyledLink = styled.div`
  width: 100%;
  display: block;
  color: #000;
  padding: 4px 16px;
  border-radius: 4px;

  &:hover {
    /* background-color: ${(props) => props.theme.colorPrimary}22; */
    /* color: #666; */
  }
`;

const ProfileImageWrapper = styled.div`
  flex-shrink: 0;
`;

const Title = styled.div`
  display: flex;
  align-items: center;

  & > p {
    width: 9rem;
    margin-left: 0.5rem;
    font-weight: 600;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: left;
  }
`;
