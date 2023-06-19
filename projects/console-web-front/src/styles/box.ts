import { css } from 'styled-components';

export const flexRowBaseStyle = css`
  display: flex;
  align-items: center;
`;

export const flexRowCenteredStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const flexRowSpaceBetweenStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const listItemStyle = css`
  padding: 1rem !important;

  & > * {
    width: 100%;
  }
`;

export const paginationBoxStyle = css`
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
`;

export const tableHeaderStyle = css`
  background-color: ${(props) => props.theme.colors.gray2}88;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;

  @media only screen and (max-width: 767px) {
    display: none;
  }
`;

export const tableCellStyle = css`
  margin-right: 1rem;
  line-height: 1.2;
`;
