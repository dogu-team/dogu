import { GetServerSidePropsContext } from 'next';

export const isWebViewAgent = (context: GetServerSidePropsContext) => {
  if (context.req.headers['user-agent']) {
    return !!context.req.headers['user-agent'].match(/electron/gi);
  }

  return false;
};
