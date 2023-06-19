import { css } from 'styled-components';

export const menuItemButtonStyles = css<{ danger?: boolean }>`
  width: 100%;
  /* min-width: 80px; */
  padding: 4px 8px;
  border: none;
  box-shadow: none;
  text-align: left;
  background-color: #fff;
  border-radius: 6px;
  transition: 0.2s all;
  color: ${(props) => (props.danger ? '#ff4d4f' : '#000')};

  &:hover {
    color: ${(props) => (props.danger ? '#fff' : '#000')};
    background-color: ${(props) => (props.danger ? '#ff4d4f' : props.theme.colors.gray2)};
  }

  &:disabled {
    cursor: not-allowed !important;
    pointer-events: none;
    background-color: #0000000a;
    color: #00000040;
  }
`;
