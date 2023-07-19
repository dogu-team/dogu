import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import useEventStore from 'src/stores/events';
import { RiExternalLinkLine } from 'react-icons/ri';
import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../styles/box';

interface Props {
  text: string;
  path: string;
  external?: boolean;
  startWith?: string;
  icon?: React.ReactNode;
  accessId?: string;
}

const SideBarMenu = (props: Props) => {
  const router = useRouter();
  const fireEvent = useEventStore((state) => state.fireEvent);

  return (
    <StyledLink
      href={props.path}
      selected={props.startWith ? router.asPath.startsWith(props.startWith) : router.asPath === props.path}
      access-id={props.accessId}
      target={props.external ? '_blank' : undefined}
      onClick={() => fireEvent('onDrawerItemClicked')}
    >
      <FlexRow>
        <IconWrapper>{props.icon}</IconWrapper>
        {props.text}
      </FlexRow>

      {props.external && <RiExternalLinkLine />}
    </StyledLink>
  );
};

export default SideBarMenu;

const StyledLink = styled(Link)<{ selected: boolean }>`
  ${flexRowSpaceBetweenStyle}
  position: relative;
  width: 100%;
  height: 35px;
  background-color: ${(props) => (props.selected ? `${props.theme.colorPrimary}66` : 'inherit')};
  padding: 0 16px;
  text-align: left;
  border: none;
  border-radius: 4px;
  transition: 0.2s all;
  font-size: 15px;
  color: #000;

  &:hover {
    background-color: ${(props) => props.theme.colorPrimary}22;
    color: #333;
  }

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 5px !important;
    display: ${(props) => (props.selected ? 'block' : 'none')};
    width: 2px;
    height: 25px;
    background-color: ${(props) => props.theme.colorPrimary} !important;
  }
`;

const IconWrapper = styled.div`
  margin: 0 8px 0 4px;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
