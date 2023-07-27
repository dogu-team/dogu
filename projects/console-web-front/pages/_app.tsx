import 'reflect-metadata';

import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { ThemeProvider } from 'styled-components';
import { ConfigProvider, notification } from 'antd';
import { SWRConfig } from 'swr';
import NProgress from 'nprogress';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import 'antd/dist/reset.css';
import 'nprogress/nprogress.css';

import GlobalStyles from 'src/styles/GlobalStyles';
import { theme, styledComponentsTheme } from 'src/styles/theme';

export type NextPageWithLayout<P = {}> = NextPage<P> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  const getLayout = Component.getLayout ?? ((page) => page);
  notification.config({
    maxCount: 1,
  });

  useEffect(() => {
    if (!window.navigator.userAgent.match(/electron/gi)) {
      const startProgress = () => NProgress.start();
      const finishProgress = () => NProgress.done();

      router.events.on('routeChangeStart', startProgress);
      router.events.on('routeChangeComplete', finishProgress);
      router.events.on('routeChangeError', finishProgress);
    }
  }, []);

  useEffect(() => {
    // alert due to dashboard's responsive design is not implemented yet
    if (router.asPath.startsWith('/dashboard/')) {
      if (window.innerWidth < 767 && sessionStorage.getItem('responsiveDesignAlert') !== 'true') {
        const alertString = 'Dogu 콘솔은 아직 모바일 뷰를 완전히 지원하지 않습니다. 원할한 사용을 위해 데스크탑 브라우저를 사용해주세요.';
        alert(alertString);
        sessionStorage.setItem('responsiveDesignAlert', 'true');
      }
    }
  }, [router.asPath]);

  return (
    <>
      <ConfigProvider
        theme={{
          token: theme,
        }}
      >
        <ThemeProvider theme={styledComponentsTheme}>
          <SWRConfig value={{ provider: () => new Map() }}>
            <GlobalStyles />
            {getLayout(<Component {...pageProps} />)}
          </SWRConfig>
        </ThemeProvider>
      </ConfigProvider>
    </>
  );
}

export default MyApp;
