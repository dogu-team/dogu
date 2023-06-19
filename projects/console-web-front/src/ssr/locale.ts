import { GetServerSidePropsContext, Redirect } from 'next';

export const redirectWithLocale = (context: GetServerSidePropsContext, path: string, permanent: boolean): Redirect => {
  const { locale, defaultLocale } = context;

  return {
    destination: locale === defaultLocale ? path : `/${locale}${path}`,
    permanent,
  };
};
