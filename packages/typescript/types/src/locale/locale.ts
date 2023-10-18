import { PlatformType } from '..';

export const LanguageCodes = [
  'ar',
  'bg',
  'ca',
  'zh',
  'hr',
  'cs',
  'da',
  'de',
  'nl',
  'en',
  'et',
  'fil',
  'fi',
  'fr',
  'el',
  'he',
  'hi',
  'hu',
  'is',
  'in',
  'it',
  'ja',
  'ko',
  'lt',
  'ms',
  'no',
] as const;
export type LanguageCode = (typeof LanguageCodes)[number];

export const LanguadeCodeToDescription: Record<LanguageCode, string> = {
  ar: 'Arabic',
  bg: 'Bulgarian',
  ca: 'Catalan',
  zh: 'Chinese',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Dansk', // Danish
  de: 'Deutsch', // German
  nl: 'Dutch',
  en: 'English',
  et: 'Estonian',
  fil: 'Filipino',
  fi: 'Finnish',
  fr: 'French',
  el: 'Greek',
  he: 'Hebrew',
  hi: 'Hindi',
  hu: 'Hungarian',
  is: 'Icelandic',
  in: 'Indonesian',
  it: 'Italiano', // Italian
  ja: 'Japanese',
  ko: 'Korean',
  lt: 'Lithuanian',
  ms: 'Malay',
  no: 'Norwegian',
};

export const CountryCodes = [
  'DZ',
  'LY',
  'MA',
  'TN',
  'BG',
  'HK',
  'TW',
  'DK',
  'DE',
  'NL',
  'AU',
  'CA',
  'IN',
  'IE',
  'ZA',
  'GB',
  'US',
  'EE',
  'PH',
  'FR',
  'IS',
  'ID',
  'LT',
  'MY',
  'NO',
] as const;
export type CountryCode = (typeof CountryCodes)[number];

export const CounttryCodeToDescription: Record<CountryCode, string> = {
  DZ: 'Algeria',
  LY: 'Libya',
  MA: 'Morocco',
  TN: 'Tunisia',
  BG: 'Bulgaria',
  HK: 'Hong Kong',
  TW: 'Taiwan',
  DK: 'Denmark',
  DE: 'Germany',
  NL: 'Netherlands',
  AU: 'Australia',
  CA: 'Canada',
  IN: 'India',
  IE: 'Ireland',
  ZA: 'South Africa',
  GB: 'United Kingdom',
  US: 'United States',
  EE: 'Estonia',
  PH: 'Philippines',
  FR: 'France',
  IS: 'Iceland',
  ID: 'Indonesia',
  LT: 'Lithuania',
  MY: 'Malaysia',
  NO: 'Norway',
};

export const LocaleVariantCodes = ['Hans', 'Hant'] as const;
export type LocaleVariantCode = (typeof LocaleVariantCodes)[number];

export const LocaleVariantCodeToDescription: Record<LocaleVariantCode, string> = {
  Hans: 'Simplified',
  Hant: 'Traditional',
};

export const LocaleInfos: LocaleInfo[] = [
  {
    code: {
      language: 'ar',
      country: 'DZ',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'ar',
      country: 'LY',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'ar',
      country: 'MA',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'ar',
      country: 'TN',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'bg',
      country: 'BG',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'ca',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'zh',
      variant: 'Hans',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'zh',
      variant: 'Hant',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'zh',
      variant: 'Hant',
      country: 'HK',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'zh',
      variant: 'Hant',
      country: 'TW',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'hr',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'cs',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'da',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'de',
      country: 'DE',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'nl',
      country: 'NL',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'en',
      country: 'AU',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'en',
      country: 'CA',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'en',
      country: 'IN',
    },
    availability: {
      platforms: ['android'],
    },
  },

  {
    code: {
      language: 'en',
      country: 'IE',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'en',
      country: 'ZA',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'en',
      country: 'GB',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'en',
      country: 'US',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'et',
      country: 'EE',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'fil',
      country: 'PH',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'fi',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'fr',
      country: 'CA',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'fr',
      country: 'FR',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'el',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'he',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'hi',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'hu',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'is',
      country: 'IS',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'in',
      country: 'ID',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'it',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'ja',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'ko',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'lt',
      country: 'LT',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'ms',
      country: 'MY',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'no',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'no',
      country: 'NO',
    },
    availability: {
      platforms: ['android'],
    },
  },
];

export interface LocaleCode {
  language: LanguageCode;
  country?: CountryCode;
  variant?: LocaleVariantCode;
}

export interface LocaleAvailability {
  platforms: PlatformType[];
}

export interface LocaleInfo {
  code: LocaleCode;
  availability: LocaleAvailability;
}
