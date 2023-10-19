import { IsFilledString } from '@dogu-tech/common';
import { IsOptional, IsString } from 'class-validator';
import { PlatformType } from '..';

export const LanguadeCodeToDescription = {
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
  pl: 'Polish',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  sr: 'Serbian',
  sk: 'Slovak',
  sl: 'Slovenian',
  es: 'Spanish',
  sv: 'Swedish',
  th: 'Thai',
  tr: 'Turkish',
  uk: 'Ukrainian',
  vi: 'Vietnamese',
} as const;

export type LanguageCode = keyof typeof LanguadeCodeToDescription;
export const LanguageCodes = Object.keys(LanguadeCodeToDescription) as LanguageCode[];

export const RegionCodeToDescription = {
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
  PL: 'Poland',
  BR: 'Brazil',
  PT: 'Portugal',
  SI: 'Slovenia',
  AR: 'Argentina',
  ES: 'Spain',
  SE: 'Sweden',
  TH: 'Thailand',
  UA: 'Ukraine',
} as const;

export type RegionCode = keyof typeof RegionCodeToDescription;
export const RegionCodes = Object.keys(RegionCodeToDescription) as RegionCode[];

export const LocaleScriptCodeToDescription = {
  Hans: 'Simplified',
  Hant: 'Traditional',
} as const;

export type LocaleScriptCode = keyof typeof LocaleScriptCodeToDescription;
export const LocaleScriptCodes = Object.keys(LocaleScriptCodeToDescription) as LocaleScriptCode[];

/*
 * ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale#description
 */
export interface LocaleCode {
  language: LanguageCode;
  script?: LocaleScriptCode;
  region?: RegionCode;
}

export class LocaleCodeDto implements LocaleCode {
  @IsFilledString()
  language!: LanguageCode;

  @IsOptional()
  @IsString()
  script?: LocaleScriptCode;

  @IsOptional()
  @IsString()
  region?: RegionCode;
}

export interface LocaleAvailability {
  platforms: PlatformType[];
}

export interface LocaleInfo {
  code: LocaleCode;
  availability: LocaleAvailability;
}

export const LocaleInfos: LocaleInfo[] = [
  {
    code: {
      language: 'ar',
      region: 'DZ',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'ar',
      region: 'LY',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'ar',
      region: 'MA',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'ar',
      region: 'TN',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'bg',
      region: 'BG',
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
      script: 'Hans',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'zh',
      script: 'Hant',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'zh',
      script: 'Hant',
      region: 'HK',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'zh',
      script: 'Hant',
      region: 'TW',
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
      region: 'DE',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'nl',
      region: 'NL',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'en',
      region: 'AU',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'en',
      region: 'CA',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'en',
      region: 'IN',
    },
    availability: {
      platforms: ['android'],
    },
  },

  {
    code: {
      language: 'en',
      region: 'IE',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'en',
      region: 'ZA',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'en',
      region: 'GB',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'en',
      region: 'US',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'et',
      region: 'EE',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'fil',
      region: 'PH',
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
      region: 'CA',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'fr',
      region: 'FR',
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
      region: 'IS',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'in',
      region: 'ID',
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
      region: 'LT',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'ms',
      region: 'MY',
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
      region: 'NO',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'pl',
      region: 'PL',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'pt',
      region: 'BR',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'pt',
      region: 'PT',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'ro',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'ru',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'sr',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'sk',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'sl',
      region: 'SI',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'es',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'es',
      region: 'AR',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'es',
      region: 'ES',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'sv',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'sv',
      region: 'SE',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'tr',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'uk',
      region: 'UA',
    },
    availability: {
      platforms: ['android'],
    },
  },
  {
    code: {
      language: 'vi',
    },
    availability: {
      platforms: ['android'],
    },
  },
];
