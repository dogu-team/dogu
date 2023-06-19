import { FunctionComponent } from 'react';
import styled from 'styled-components';

import { HeadingProps } from 'src/types/props';
import { CommonUIProps } from 'src/types/common';

const StyledH4 = styled.h4<{ centered: boolean }>`
  font-size: 1.45rem;
  font-weight: 600;
  line-height: 1.4;
  text-align: ${(props) => (props.centered ? 'center' : 'left')};
`;

interface Props extends HeadingProps, CommonUIProps {}

const H4: FunctionComponent<Props> = ({ centered = false, children, className }) => {
  return (
    <StyledH4 className={className} centered={centered}>
      {children}
    </StyledH4>
  );
};

export default H4;
