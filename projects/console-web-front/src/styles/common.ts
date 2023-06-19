import { css } from 'styled-components';

export const scrollbarStyle = css`
  &::-webkit-scrollbar {
    width: 0.5rem;
    background: rgba(0, 0, 0, 0);
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 5px;
  }
`;
