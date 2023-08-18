import styled from 'styled-components';
import Link from 'next/link';
import Head from 'next/head';

import { NextPageWithLayout } from './_app';
import ConsoleBasicLayout from '../src/components/layouts/ConsoleBasicLayout';

const CustomNotFoundPage: NextPageWithLayout = () => {
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

CustomNotFoundPage.getLayout = (page) => {
  return <ConsoleBasicLayout>{page}</ConsoleBasicLayout>;
};

export default CustomNotFoundPage;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100dvh - 57px);
  align-items: center;
  justify-content: center;
`;

const StyeldH2 = styled.h2`
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 24px;
  text-align: center;
`;
