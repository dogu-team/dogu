import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import styled from 'styled-components';

export interface MenuLinkTabItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  blank?: boolean;
  startsWith?: boolean;
  'access-id'?: string;
  onClick?: () => void;
}

export interface CustomMenuLinkTabItemProps {
  tab: (selected: boolean) => React.ReactNode;
  href: string;
}

export interface MenuLinkTabProps {
  tabs: (MenuLinkTabItemProps | CustomMenuLinkTabItemProps)[];
}

const MenuLinkTabs = ({ tabs }: MenuLinkTabProps) => {
  const router = useRouter();

  return (
    <Box>
      {tabs.map((tab) => {
        if ((tab as CustomMenuLinkTabItemProps).tab) {
          return (
            <React.Fragment key={tab.href}>
              {(tab as CustomMenuLinkTabItemProps).tab(router.asPath === tab.href)}
            </React.Fragment>
          );
        }

        return (
          <MenuLinkTabItem
            key={tab.href}
            title={(tab as MenuLinkTabItemProps).title}
            selected={
              (tab as MenuLinkTabItemProps).startsWith ? router.asPath.startsWith(tab.href) : router.asPath === tab.href
            }
            href={tab.href}
            icon={(tab as MenuLinkTabItemProps).icon}
            blank={(tab as MenuLinkTabItemProps).blank}
            access-id={(tab as MenuLinkTabItemProps)['access-id']}
            onClick={(tab as MenuLinkTabItemProps).onClick}
          />
        );
      })}
    </Box>
  );
};

export default MenuLinkTabs;

export const MenuLinkTabItem = ({
  title,
  icon,
  href,
  selected,
  ...props
}: MenuLinkTabItemProps & { selected: boolean }) => {
  return (
    <StyledLink
      target={props.blank ? '_blank' : undefined}
      rel={props.blank ? 'noopener noreferrer' : undefined}
      selected={selected}
      href={href}
      access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? props['access-id'] : undefined}
      onClick={props.onClick}
    >
      {icon}
      <p>{title}</p>
    </StyledLink>
  );
};

const Box = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${(props) => props.theme.colors.gray3};
`;

const StyledLink = styled(Link)<{ selected: boolean }>`
  position: relative;
  display: flex;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  align-items: center;
  border-radius: 4px;
  transition: all 0.2s;

  &::after {
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    right: 0;
    display: block;
    content: '';
    border-bottom: 3px solid ${(props) => (props.selected ? props.theme.colors.gray4 : 'transparent')};
  }

  & > * {
    color: #000;
  }

  p {
    margin-left: 0.5rem;
  }

  &:hover {
    background-color: ${(props) => props.theme.colors.gray2};
  }
`;
