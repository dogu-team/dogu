import React, { ButtonHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';

type ButtonSize = 'large' | 'small';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  size: ButtonSize;
  primary?: boolean;
  loading?: boolean;
}

const Button = ({ size, primary, loading, children, ...props }: Props) => {
  if (size === 'large') {
    return (
      <StyledLargeButton {...props} primary={primary} disabled={loading ?? props.disabled}>
        {loading ? <LoadingOutlined style={{ fontSize: '1.25rem' }} /> : children}
      </StyledLargeButton>
    );
  }

  if (size === 'small') {
    return (
      <StyledSmallButton {...props} primary={primary} disabled={loading ?? props.disabled}>
        {loading ? <LoadingOutlined style={{ fontSize: '1rem' }} /> : children}
      </StyledSmallButton>
    );
  }

  return null;
};

export default Button;

const defaultStyles = css<{ primary?: boolean }>`
  display: inline-flex;
  background-color: ${(props) => (props.primary ? props.theme.main.colors.blue4 : props.theme.main.colors.white)};
  box-shadow: ${(props) => props.theme.main.shadows.blueBold};
  color: ${(props) => (props.primary ? props.theme.main.colors.white : props.theme.main.colors.blue4)};
  border: 1px solid ${(props) => props.theme.main.colors.blue4};
  border-radius: 50px;
  justify-content: center;
  align-items: center;
`;

const StyledLargeButton = styled.button`
  ${defaultStyles}
  height: 60px;
  padding: 0 48px;
  font-size: 1.25rem;
  font-weight: 700;

  @media only screen and (max-width: 767px) {
    height: 3rem;
    padding: 0 2rem;
  }
`;

const StyledSmallButton = styled.button`
  ${defaultStyles}
  height: 36px;
  padding: 0 15px;
  box-shadow: none;
`;
