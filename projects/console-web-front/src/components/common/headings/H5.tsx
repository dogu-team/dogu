import { FunctionComponent } from 'react';
import styled from 'styled-components';

import { HeadingProps } from 'src/types/props';
import { CommonUIProps } from 'src/types/common';

const StyledH5 = styled.h5<{ centered: boolean }>`
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.2;
  text-align: ${(props) => (props.centered ? 'center' : 'left')};
`;

interface Props extends HeadingProps, CommonUIProps {}

const H5: FunctionComponent<Props> = ({ centered = false, children, className }) => {
  return (
    <StyledH5 centered={centered} className={className}>
      {children}
    </StyledH5>
  );
};

export default H5;
