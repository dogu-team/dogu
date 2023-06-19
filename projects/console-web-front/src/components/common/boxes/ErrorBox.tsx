import styled from 'styled-components';

const Box = styled.div`
  display: flex;
  height: 300px;
  padding: 24px;
  border-radius: 12px;
  background-color: #f78a77;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
`;

const Desc = styled.p`
  margin-top: 20px;
`;

interface Props {
  title: string;
  desc: string;
}

const ErrorBox = ({ title, desc }: Props) => {
  return (
    <Box>
      <Title>{title}</Title>
      <Desc>{desc}</Desc>
    </Box>
  );
};

export default ErrorBox;
