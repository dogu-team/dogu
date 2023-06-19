export const langToLocaleMapper = {
  ko: 'ko-KR',
  en: 'en-US',
};

export const getLocaleFormattedDate = (lang: string, date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const locale = langToLocaleMapper[lang as keyof typeof langToLocaleMapper];
  return new Intl.DateTimeFormat(locale, options).format(date);
};

export const getLocaledLink = (lang: string | undefined, link: string): string => {
  if (lang === 'ko') {
    return `/ko${link}`;
  }

  return link;
};
