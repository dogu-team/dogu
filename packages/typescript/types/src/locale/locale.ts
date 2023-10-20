import { IsFilledString } from '@dogu-tech/common';
import { IsOptional, IsString } from 'class-validator';
import { PlatformType } from '..';

export const LanguadeCodeToDescription = {
  ar: 'Arabic',
  bg: 'Bulgarian',
  ca: 'Catalan',
  cs: 'Czech',
  da: 'Dansk', // Danish
  de: 'Deutsch', // German
  el: 'Greek',
  en: 'English',
  es: 'Spanish',
  et: 'Estonian',
  fi: 'Finnish',
  fil: 'Filipino',
  fr: 'French',
  he: 'Hebrew',
  hi: 'Hindi',
  hr: 'Croatian',
  hu: 'Hungarian',
  in: 'Indonesian',
  is: 'Icelandic',
  it: 'Italiano', // Italian
  ja: 'Japanese',
  ko: 'Korean',
  lt: 'Lithuanian',
  ms: 'Malay',
  nl: 'Dutch',
  no: 'Norwegian',
  pl: 'Polish',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  sk: 'Slovak',
  sl: 'Slovenian',
  sr: 'Serbian',
  sv: 'Swedish',
  th: 'Thai',
  tr: 'Turkish',
  uk: 'Ukrainian',
  vi: 'Vietnamese',
  zh: 'Chinese',
} as const;

export type LanguageCode = keyof typeof LanguadeCodeToDescription;
export const LanguageCodes = Object.keys(LanguadeCodeToDescription) as LanguageCode[];

export const RegionCodeToDescription = {
  AR: 'Argentina',
  AU: 'Australia',
  BG: 'Bulgaria',
  BR: 'Brazil',
  CA: 'Canada',
  CN: 'China',
  CZ: 'Czech Republic',
  DE: 'Germany',
  DK: 'Denmark',
  DZ: 'Algeria',
  EE: 'Estonia',
  ES: 'Spain',
  FI: 'Finland',
  FR: 'France',
  GB: 'United Kingdom',
  GR: 'Greece',
  HK: 'Hong Kong',
  HR: 'Croatia',
  HU: 'Hungary',
  ID: 'Indonesia',
  IE: 'Ireland',
  IL: 'Israel',
  IT: 'Italy',
  IN: 'India',
  IS: 'Iceland',
  JP: 'Japan',
  KR: 'South Korea',
  LT: 'Lithuania',
  LY: 'Libya',
  MA: 'Morocco',
  MY: 'Malaysia',
  NL: 'Netherlands',
  NO: 'Norway',
  PH: 'Philippines',
  PL: 'Poland',
  PT: 'Portugal',
  RO: 'Romania',
  RS: 'Serbia',
  RU: 'Russia',
  SE: 'Sweden',
  SI: 'Slovenia',
  SK: 'Slovakia',
  TH: 'Thailand',
  TN: 'Tunisia',
  TR: 'Turkey',
  TW: 'Taiwan',
  UA: 'Ukraine',
  US: 'United States',
  VN: 'Vietnam',
  ZA: 'South Africa',
} as const;

export type RegionCode = keyof typeof RegionCodeToDescription;
export const RegionCodes = Object.keys(RegionCodeToDescription) as RegionCode[];

export const LocaleScriptCodeToDescription = {
  Hans: 'Simplified',
  Hant: 'Traditional',
} as const;

export type LocaleScriptCode = keyof typeof LocaleScriptCodeToDescription;
export const LocaleScriptCodes = Object.keys(LocaleScriptCodeToDescription) as LocaleScriptCode[];

export const LanguageToDefaultRegionMap: Record<LanguageCode, RegionCode> = {
  ar: 'DZ',
  bg: 'BG',
  ca: 'ES',
  zh: 'CN',
  hr: 'HR',
  cs: 'CZ',
  da: 'DK',
  de: 'DE',
  nl: 'NL',
  en: 'US',
  et: 'EE',
  fil: 'PH',
  fi: 'FI',
  fr: 'FR',
  el: 'GR',
  he: 'IL',
  hi: 'IN',
  hu: 'HU',
  is: 'IS',
  in: 'ID',
  it: 'IT',
  ja: 'JP',
  ko: 'KR',
  lt: 'LT',
  ms: 'MY',
  no: 'NO',
  pl: 'PL',
  pt: 'PT',
  ro: 'RO',
  ru: 'RU',
  sr: 'RS',
  sk: 'SK',
  sl: 'SI',
  es: 'ES',
  sv: 'SE',
  th: 'TH',
  tr: 'TR',
  uk: 'UA',
  vi: 'VN',
};

/*
 * ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale#description
 */
export interface LocaleCode {
  language: LanguageCode;
  script?: LocaleScriptCode;
  region?: RegionCode;
}

export function createLocaleCode(localeString: string): LocaleCode {
  const locale = new Intl.Locale(localeString);
  const language = locale.language as LanguageCode;
  const script = locale.script as LocaleScriptCode | undefined;
  const region = locale.region as RegionCode | undefined;

  return {
    language,
    script,
    region,
  };
}

export function validateLocaleCode(code: LocaleCode): void {
  if (!LanguageCodes.includes(code.language)) {
    throw new Error(`Invalid language code: ${code.language}`);
  }
  if (code.script && !LocaleScriptCodes.includes(code.script)) {
    throw new Error(`Invalid script code: ${code.script}`);
  }
  if (code.region && !RegionCodes.includes(code.region)) {
    throw new Error(`Invalid region code: ${code.region}`);
  }
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
