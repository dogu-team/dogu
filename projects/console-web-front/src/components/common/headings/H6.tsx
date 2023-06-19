import styled from 'styled-components';

import { CommonUIProps } from '../../../types/common';
import { HeadingProps } from '../../../types/props';

interface Props extends HeadingProps, CommonUIProps {}

const H6 = ({ centered = false, children, className }: Props) => {
  return (
    <StyledH6 centered={centered} className={className}>
      {children}
    </StyledH6>
  );
};

const StyledH6 = styled.h6<{ centered: boolean }>`
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1.2;
  text-align: ${(props) => (props.centered ? 'center' : 'left')};
`;

export default H6;
