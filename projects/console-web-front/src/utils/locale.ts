import { BillingCurrency } from '@dogu-private/console';

export const langToLocaleMapper = {
  ko: 'ko-KR',
  en: 'en-US',
};

export const getLocaleFormattedDate = (
  lang: string = 'en',
  date: Date,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const locale = langToLocaleMapper[lang as keyof typeof langToLocaleMapper] ?? 'en-US';
  return new Intl.DateTimeFormat(locale, options).format(date);
};

export const getLocaleFormattedPrice = (lang: string = 'en', currency: BillingCurrency, price: number): string => {
  const locale = currency === 'USD' ? 'en-US' : langToLocaleMapper[lang as keyof typeof langToLocaleMapper] ?? 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);
};

export const getLocaledLink = (lang: string | undefined, link: string): string => {
  if (lang === 'ko') {
    return `/ko${link}`;
  }

  return link;
};
