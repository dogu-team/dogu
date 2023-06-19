import Link from 'next/link';
import styled, { ThemeProvider } from 'styled-components';

import { styledComponentsTheme } from '../../styles';
import ProfileImage from '../user/ProfileImage';

export interface SideBarTitleProps {
  href: string;
  subTitle: string;
  profileImageUrl: string | null;
  name: string;
  onClick?: () => void;
}

export const SideBarTitle = ({ href, subTitle, name, profileImageUrl, onClick }: SideBarTitleProps) => {
  return (
    <ThemeProvider theme={styledComponentsTheme}>
      <Box>
        <SubTitle>{subTitle}</SubTitle>
        <StyledLink href={href} onClick={onClick}>
          <Title>
            <ProfileImageWrapper>
              <ProfileImage shape="square" size={28} name={name} profileImageUrl={profileImageUrl} />
            </ProfileImageWrapper>
            <p>{name}</p>
          </Title>
        </StyledLink>
      </Box>
    </ThemeProvider>
  );
};

const Box = styled.div`
  transition: all 0.2s;
`;

const SubTitle = styled.p`
  font-size: 0.8rem;
  padding: 0 16px;
  margin-bottom: 0.25rem;
  color: ${(props) => props.theme.colors.gray6};
`;

const StyledLink = styled(Link)`
  width: 100%;
  display: block;
  color: #000;
  padding: 4px 16px;
  border-radius: 4px;

  &:hover {
    background-color: ${(props) => props.theme.colorPrimary}22;
    color: #666;
  }
`;

const ProfileImageWrapper = styled.div`
  flex-shrink: 0;
`;

const Title = styled.div`
  display: flex;
  align-items: center;

  & > p {
    margin-left: 12px;
    text-transform: uppercase;
    font-weight: 600;
    text-overflow: ellipsis;
  }
`;
