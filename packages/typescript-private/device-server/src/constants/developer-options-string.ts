import { AndroidLocale } from '@dogu-private/types';

// ref: https://sourcegraph.com/search?q=context%3Aglobal+repo%3A%5Egithub%5C.com%2FLineageOS%2Fandroid_frameworks_base%24+development_settings_title&patternType=standard&sm=1&groupBy=path
// some fixs are applied (ms, id-Id, jp, zh-Hans, zh-Hant)
export const DeveloperOptionsString: {
  [key in AndroidLocale]: string[];
} = {
  nb: ['Utvikleralternativer'],
  af: ['Ontwikkelaaropsies'],
  in: ['Opsi developer'],
  'id-ID': ['Pilihan pengembang'],
  da: ['Indstillinger for udviklere'],
  et: ['Arendaja valikud'],
  sv: ['Utvecklaralternativ'],
  is: ['Forritunarkostir'],
  ms: ['Pilihan pemaju', 'Pilihan pembangun'],
  nl: ['Ontwikkelaarsopties'],
  fi: ['Kehittäjäasetukset'],
  hr: ['Opcije za razvojne programere'],
  uz: ['Dasturchi sozlamalari', 'Ishlab chiqaruvchi opsiyalari'],
  it: ['Opzioni sviluppatore'],
  bs: ['Opcije za programere'],
  sw: ['Chaguo za wasanidi'],
  de: ['Entwickleroptionen'],
  tr: ['Geliştirici seçenekleri'],
  pl: ['Opcje programisty'],
  az: ['Developer seçimləri'],
  cs: ['Pro vývojáře'],
  sl: ['Možnosti za razvijalce'],
  tl: ['Mga opsiyon ng developer', 'Mga opsyon ng developer'],
  fil: ['Mga opsiyon ng developer', 'Mga opsyon ng developer'],
  lt: ['Kūrėjo parinktys'],
  zu: ['Izinketho Zonjiniyela'],
  eu: ['Garatzaileentzako aukerak'],
  ko: ['개발자 옵션'],
  sk: ['Pre vývojárov'],
  es: ['Opciones de desarrollador', 'Opciones para desarrolladores'],
  'es-US': ['Opciones de desarrollador', 'Opciones para desarrolladores'],
  lv: ['Izstrādātāju opcijas'],
  gl: ['Opcións para programadores'],
  ro: ['Opțiuni pentru dezvoltatori'],
  sq: ['Opsionet e zhvilluesit'],
  ca: ['Opcions per a desenvolupadors'],
  fr: ['Options pour les développeurs', 'Options de développement'],
  'fr-CA': ['Options pour les développeurs', 'Options de développement'],
  hu: ['Fejlesztői beállítások'],
  vi: ['Tùy chọn cho nhà phát triển', 'Tùy chọn cho nhà phát triển'],
  ja: ['開発者向け​オプション'],
  iw: ['אפשרויות למפתחים'],
  ur: ['ڈویلپر کے اختیارات'],
  ar: ['خيارات المطورين'],
  am: ['የገንቢዎች አማራጮች'],
  fa: ['گزینه‌های برنامه‌نویسان'],
  kk: ['Әзірлеуші опциялары'],
  sr: ['Опције за програмере'],
  uk: ['Параметри розробника'],
  ru: ['Параметры разработчика', 'Для разработчиков', 'Настройки разработчика', 'Параметры разработчика'],
  mn: ['Хөгжүүлэгчийн сонголтууд', 'Хөгжүүлэгчийн тохиргоо'],
  mk: ['Програмерски опции'],
  be: ['Параметры распрацоўшчыка'],
  ky: ['Иштеп чыгуучунун параметрлери'],
  hy: ['Մշակողի ընտրանքներ'],
  bg: ['Опции за програмисти'],
  el: ['Επιλογές για προγραμματιστές'],
  si: ['වර්ධක විකල්ප'],
  pa: ['ਵਿਕਾਸਕਾਰ ਚੋਣਾਂ'],
  mr: ['डेव्हलपर पर्याय'],
  lo: ['ຕົວເລືອກນັກພັດທະນາ'],
  gu: ['ડેવલપરના વિકલ્પો'],
  th: ['ทาง​เลือก​ผู้​พัฒนา', 'ตัวเลือกสำหรับนักพัฒนาแอป'],
  ne: ['विकासकर्ताका विकल्पहरू'],
  as: ['বিকাশকৰ্তাৰ বিকল্পসমূহ'],
  hi: ['डेवलपर के लिए सेटिंग और टूल'],
  bn: ['ডেভেলপার বিকল্প'],
  or: ['ଡେଭଲପରଙ୍କ ପାଇଁ ବିକଳ୍ପଗୁଡ଼ିକ'],
  km: ['ជម្រើស​អភិវឌ្ឍនករ', 'ជម្រើសសម្រាប់អ្នកអភិវឌ្ឍន៍'],
  kn: ['ಡೆವಲಪರ್ ಆಯ್ಕೆಗಳು'],
  ka: ['პარამეტრები დეველოპერებისთვის'],
  te: ['డెవలపర్ ఆప్షన్‌లు'],
  my: ['ဆော့ဝဲလ်ရေးသူ ရွေးစရာများ', 'တိုးတက်အောင်လုပ်သူ ရွေးချယ်ရန်များ', 'တိုးတက္ေအာင္လုပ္သူ ေရြးခ်ယ္ရန္မ်ား'],
  'my-MM': ['ဆော့ဝဲလ်ရေးသူ ရွေးစရာများ', 'တိုးတက်အောင်လုပ်သူ ရွေးချယ်ရန်များ', 'တိုးတက္ေအာင္လုပ္သူ ေရြးခ်ယ္ရန္မ်ား'],
  ta: ['டெவெலப்பர் விருப்பங்கள்'],
  ml: ['ഡെവലപ്പർ ഓ‌പ്ഷനുകൾ'],
  en: ['Developer options'],
  'en-US': ['Developer options'],
  'en-XA': ['Developer options'],
  'en-CA': ['Developer options'],
  'en-AU': ['Developer options'],
  'en-GB': ['Developer options'],
  'en-IN': ['Developer options'],
  zh: ['开发者选项', '開發人員選項'],
  'zh-Hans': ['开发者选项'],
  'zh-Hant': ['開發人員選項'],
  pt: ['Opções de programador', 'Opções do desenvolvedor'],
  'pt-PT': ['Opções de programador'],
  'pt-BR': ['Opções do desenvolvedor'],
  'sr-Latn': ['Opcije za programere'],
};
