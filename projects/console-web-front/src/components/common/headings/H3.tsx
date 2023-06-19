import { FunctionComponent } from 'react';
import styled from 'styled-components';

import { HeadingProps } from 'src/types/props';

const StyledH3 = styled.h3<{ centered: boolean }>`
  font-size: 2rem;
  font-weight: 600;
  text-align: ${(props) => (props.centered ? 'center' : 'left')};
  line-height: 1.2;
`;

const H3: FunctionComponent<HeadingProps> = ({ centered = false, children }) => {
  return <StyledH3 centered={centered}>{children}</StyledH3>;
};

export default H3;
