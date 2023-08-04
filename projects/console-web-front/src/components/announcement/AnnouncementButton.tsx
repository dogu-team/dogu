import { Button } from 'antd';
import { TfiAnnouncement } from 'react-icons/tfi';
import styled from 'styled-components';
import Link from 'next/link';

import { flexRowBaseStyle, flexRowCenteredStyle } from '../../styles/box';

const AnnouncementButton = () => {
  return (
    <div>
      <StyledLink
        href="/"
        onClick={(e) => {
          e.preventDefault();

          //@ts-ignore
          const beamer = globalThis.Beamer;
          if (beamer) {
            beamer.show();
          }
        }}
      >
        <TfiAnnouncement />
      </StyledLink>
    </div>
  );
};

const StyledLink = styled(Link)`
  ${flexRowCenteredStyle}
  width: 2rem;
  height: 2rem;
  margin-right: 0.75rem;
  border-radius: 50%;
  color: #000;
  font-size: 1.2rem;

  &:hover {
    background-color: #f5f5f5;
  }
`;

export default AnnouncementButton;
