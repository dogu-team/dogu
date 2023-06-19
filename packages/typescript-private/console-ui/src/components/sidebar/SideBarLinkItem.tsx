import styled, { ThemeProvider } from 'styled-components';
import { useRouter } from 'next/router';
import Link, { LinkProps } from 'next/link';

import { styledComponentsTheme } from '../../styles';

export interface SideBarLinkItemProps extends LinkProps {
  text: string;
  startWith?: string;
  icon?: React.ReactNode;
  'access-id'?: string;
}

export const SideBarLinkItem = ({ text, startWith, icon, ...props }: SideBarLinkItemProps) => {
  const router = useRouter();

  return (
    <ThemeProvider theme={styledComponentsTheme}>
      <StyledLink selected={startWith ? router.asPath.startsWith(startWith) : router.asPath === props.href} {...props} href={props.href} as={undefined}>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        {text}
      </StyledLink>
    </ThemeProvider>
  );
};

const StyledLink = styled(Link)<{ selected: boolean }>`
  position: relative;
  display: flex;
  width: 100%;
  height: 35px;
  background-color: ${(props) => (props.selected ? `${props.theme.colorPrimary}66` : 'inherit')};
  padding: 0 16px;
  text-align: left;
  border: none;
  border-radius: 4px;
  transition: 0.2s all;
  font-size: 15px;
  align-items: center;
  color: #000;
  text-decoration: none;

  &:hover {
    background-color: ${(props) => props.theme.colorPrimary}22;
    color: #333;
  }

  &:before {
    content: '';
    position: absolute;
    left: 0;
    display: ${(props) => (props.selected ? 'block' : 'none')};
    width: 2px;
    height: 25px;
    background-color: ${(props) => props.theme.colorPrimary};
  }
`;

const IconWrapper = styled.div`
  margin: 0 8px 0 4px;
`;
