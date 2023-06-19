import { FunctionComponent } from 'react';
import styled from 'styled-components';

import { HeadingProps } from 'src/types/props';

const StyledH1 = styled.h1<{ centered: boolean }>`
  font-size: 3.5rem;
  font-weight: 700;
  text-align: ${(props) => (props.centered ? 'center' : 'left')};
  line-height: 1.2;
  white-space: pre-wrap;
`;

const H1: FunctionComponent<HeadingProps> = ({ centered = false, children }) => {
  return <StyledH1 centered={centered}>{children}</StyledH1>;
};

export default H1;
