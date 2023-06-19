import { GetServerSideProps } from 'next';
import styled from 'styled-components';

import { NextPageWithLayout } from '../../_app';

interface Props {}

const UnsubscribePage: NextPageWithLayout<Props> = () => {
  return <Box></Box>;
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  return {
    redirect: {
      destination: '/account',
      permanent: true,
    },
  };
};

export default UnsubscribePage;

const Box = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
`;
