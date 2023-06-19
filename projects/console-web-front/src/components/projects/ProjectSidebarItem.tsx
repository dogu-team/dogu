import Link from 'next/link';
import styled from 'styled-components';
import { UrlObject } from 'url';

interface Props {
  href: UrlObject | string;
  selected: boolean;
  children: React.ReactNode;
}

const ProjectSidebarItem = ({ href, selected, children }: Props) => {
  return (
    <Item href={href} selected={selected}>
      {children}
    </Item>
  );
};

export default ProjectSidebarItem;

const Item = styled(Link)<{ selected: boolean }>`
  display: flex;
  padding: 8px 12px;
  color: #000;
  transition: all 0.2s;
  border-radius: 6px;
  background-color: ${(props) => (props.selected ? `${props.theme.colorPrimary}44` : '#fff')};
  align-items: center;
  line-height: 1.5;

  &:hover {
    color: #000;
    background-color: ${(props) => (props.selected ? `${props.theme.colorPrimary}44` : props.theme.colors.gray2)};
  }
`;
