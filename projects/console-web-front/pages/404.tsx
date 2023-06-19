import styled from 'styled-components';
import { NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';

const CustomNotFoundPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Page not found | Dogu</title>
      </Head>
      <Box>
        <StyeldH2>404 - Page not found</StyeldH2>
        <p>
          Move to <Link href="/">home</Link>
        </p>
      </Box>
    </>
  );
};

export default CustomNotFoundPage;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const StyeldH2 = styled.h2`
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 24px;
  text-align: center;
`;
