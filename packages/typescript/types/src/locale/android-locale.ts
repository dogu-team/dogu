// ref: https://developer.android.com/guide/topics/resources/app-languages#sample-config
// some fixs are applied
export const AndroidLocaleCandidates = [
  'af', // Afrikaans
  'am', // Amharic
  'ar', // Arabic
  'as', // Assamese
  'az', // Azerbaijani
  'be', // Belarusian
  'bg', // Bulgarian
  'bn', // Bengali
  'bs', // Bosnian
  'ca', // Catalan
  'cs', // Czech
  'da', // Danish
  'de', // German
  'el', // Greek
  'en-AU', // English (Australia)
  'en-CA', // English (Canada)
  'en-GB', // English (United Kingdom)
  'en-IN', // English (India)
  'en-US', // English (United States)
  'en-XA', // English (Pseudo-Accents)
  'es', // Spanish (Spain)
  'es-US', // Spanish (United States)
  'et', // Estonian
  'eu', // Basque
  'fa', // Farsi
  'fi', // Finnish
  'fr', // French (France)
  'fr-CA', // French (Canada)
  'gl', // Galician
  'gu', // Gujarati
  'hi', // Hindi
  'hr', // Croatian
  'hu', // Hungarian
  'hy', // Armenian
  'id-ID', // Indonesia
  'in', // Indonesian
  'is', // Icelandic
  'it', // Italian
  'iw', // Hebrew
  'ja', // Japanese
  'ka', // Georgian
  'kk', // Kazakh
  'km', // Khmer
  'kn', // Kannada
  'ko', // Korean
  'ky', // Kyrgyz
  'lo', // Lao
  'lt', // Lithuanian
  'lv', // Latvian
  'mk', // Macedonian
  'ml', // Malayalam
  'mn', // Mongolian
  'mr', // Marathi
  'ms', // Malay
  'my', // Burmese
  'my-MM', // Burmese (Myanmar)
  'nb', // Norwegian
  'ne', // Nepali
  'nl', // Dutch
  'or', // Odia
  'pa', // Punjabi
  'pl', // Polish
  'pt-BR', // Portuguese (Brazil)
  'pt-PT', // Portuguese (Portugal)
  'ro', // Romanian
  'ru', // Russian
  'si', // Sinhala
  'sk', // Slovak
  'sl', // Slovenian
  'sq', // Albanian
  'sr', // Serbian (Cyrillic)
  'sr-Latn', // Serbian (Latin)
  'sv', // Swedish
  'sw', // Swahili
  'ta', // Tamil
  'te', // Telugu
  'th', // Thai
  'tl', // Filipino
  'tr', // Turkish
  'uk', // Ukrainian
  'ur', // Urdu
  'uz', // Uzbek
  'vi', // Vietnamese
  'zh', // Chinese
  'zh-Hans', // Chinese (Simplified)
  'zh-Hant', // Chinese (Traditional)
  'zu', // Zulu ;
] as const;

export type AndroidLocale = (typeof AndroidLocaleCandidates)[number];

export function createAndroidLocale(rawString: string): AndroidLocale | undefined {
  if (AndroidLocaleCandidates.includes(rawString as AndroidLocale)) {
    return rawString as AndroidLocale;
  }
  const startswith = AndroidLocaleCandidates.find((candidate) => {
    if (rawString.startsWith(candidate)) {
      return candidate;
    }
  });
  if (startswith) {
    return startswith;
  }
  return undefined;
}
