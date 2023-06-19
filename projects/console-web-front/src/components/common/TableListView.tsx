import styled from 'styled-components';

interface Props {
  top: React.ReactNode;
  table: React.ReactNode;
}

const TableListView = ({ top, table }: Props) => {
  return (
    <Box>
      <Top>{top}</Top>
      <div>{table}</div>
    </Box>
  );
};

export default TableListView;

const Box = styled.div``;

const Top = styled.div`
  margin-bottom: 1rem;
`;
