import { FunctionComponent } from 'react';
import styled from 'styled-components';

import { HeadingProps } from 'src/types/props';

const StyledH2 = styled.h2<{ centered: boolean }>`
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  text-align: ${(props) => (props.centered ? 'center' : 'left')};
`;

const H2: FunctionComponent<HeadingProps> = ({ centered = false, children }) => {
  return <StyledH2 centered={centered}>{children}</StyledH2>;
};

export default H2;
