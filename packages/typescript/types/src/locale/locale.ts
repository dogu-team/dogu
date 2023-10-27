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
  description: string;
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
    description: 'Arabic (Algeria)',
  },
  {
    code: {
      language: 'ar',
      region: 'LY',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Arabic (Libya)',
  },
  {
    code: {
      language: 'ar',
      region: 'MA',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Arabic (Morocco)',
  },
  {
    code: {
      language: 'ar',
      region: 'TN',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Arabic (Tunisia)',
  },
  {
    code: {
      language: 'bg',
      region: 'BG',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Bulgarian',
  },
  {
    code: {
      language: 'ca',
      region: 'ES',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Catalan',
  },
  {
    code: {
      language: 'zh',
      region: 'CN',
      script: 'Hans',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Chinese (Simplified)',
  },
  {
    code: {
      language: 'zh',
      region: 'CN',
      script: 'Hant',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Chinese (Traditional)',
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
    description: 'Chinese (HK)',
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
    description: 'Chinese (TW)',
  },
  {
    code: {
      language: 'hr',
      region: 'HR',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Croatian',
  },
  {
    code: {
      language: 'cs',
      region: 'CZ',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Czech',
  },
  {
    code: {
      language: 'da',
      region: 'DK',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Dansk',
  },
  {
    code: {
      language: 'de',
      region: 'DE',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Deutsch',
  },
  {
    code: {
      language: 'nl',
      region: 'NL',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Dutch',
  },
  {
    code: {
      language: 'en',
      region: 'AU',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'English (Australia)',
  },
  {
    code: {
      language: 'en',
      region: 'CA',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'English (Canada)',
  },
  {
    code: {
      language: 'en',
      region: 'IN',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'English (India)',
  },

  {
    code: {
      language: 'en',
      region: 'IE',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'English (Ireland)',
  },
  {
    code: {
      language: 'en',
      region: 'ZA',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'English (South Africa)',
  },
  {
    code: {
      language: 'en',
      region: 'GB',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'English (UK)',
  },
  {
    code: {
      language: 'en',
      region: 'US',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'English (US)',
  },
  {
    code: {
      language: 'et',
      region: 'EE',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Estonian',
  },
  {
    code: {
      language: 'fil',
      region: 'PH',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Filipino',
  },
  {
    code: {
      language: 'fi',
      region: 'FI',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Finnish',
  },
  {
    code: {
      language: 'fr',
      region: 'CA',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'French (Canada)',
  },
  {
    code: {
      language: 'fr',
      region: 'FR',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'French (France)',
  },
  {
    code: {
      language: 'el',
      region: 'GR',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Greek',
  },
  {
    code: {
      language: 'he',
      region: 'IL',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Hebrew',
  },
  {
    code: {
      language: 'hi',
      region: 'IN',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Hindi',
  },
  {
    code: {
      language: 'hu',
      region: 'HU',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Hungarian',
  },
  {
    code: {
      language: 'is',
      region: 'IS',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Icelandic',
  },
  {
    code: {
      language: 'in',
      region: 'ID',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Indonesian',
  },
  {
    code: {
      language: 'it',
      region: 'IT',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Italiano',
  },
  {
    code: {
      language: 'ja',
      region: 'JP',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Japanese',
  },
  {
    code: {
      language: 'ko',
      region: 'KR',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Korean',
  },
  {
    code: {
      language: 'lt',
      region: 'LT',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Lithuanian',
  },
  {
    code: {
      language: 'ms',
      region: 'MY',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Malay',
  },
  {
    code: {
      language: 'no',
      region: 'NO',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Norwegian',
  },
  {
    code: {
      language: 'pl',
      region: 'PL',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Polish',
  },
  {
    code: {
      language: 'pt',
      region: 'BR',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Portuguese (Brazil)',
  },
  {
    code: {
      language: 'pt',
      region: 'PT',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Portuguese (Portugal)',
  },
  {
    code: {
      language: 'ro',
      region: 'RO',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Romanian',
  },
  {
    code: {
      language: 'ru',
      region: 'RU',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Russian',
  },
  {
    code: {
      language: 'sr',
      region: 'RS',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Serbian',
  },
  {
    code: {
      language: 'sk',
      region: 'SK',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Slovak',
  },
  {
    code: {
      language: 'sl',
      region: 'SI',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Slovenian',
  },
  {
    code: {
      language: 'es',
      region: 'ES',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Spanish',
  },
  {
    code: {
      language: 'es',
      region: 'AR',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Spanish (Argentina)',
  },
  {
    code: {
      language: 'sv',
      region: 'SE',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Swedish',
  },
  {
    code: {
      language: 'tr',
      region: 'TR',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Turkish',
  },
  {
    code: {
      language: 'uk',
      region: 'UA',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Ukrainian',
  },
  {
    code: {
      language: 'vi',
      region: 'VN',
    },
    availability: {
      platforms: ['android'],
    },
    description: 'Vietnamese',
  },
];
