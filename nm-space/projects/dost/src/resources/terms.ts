import { ExternalKey } from '../shares/external';

export const externalTerms: { keys: ExternalKey[]; name: string; url: string | null }[] = [
  { keys: ['android-sdk'], name: 'Android SDK', url: 'https://developer.android.com/studio/terms' },
  { keys: ['jdk'], name: 'OpenJDK', url: 'https://www.eclipse.org/legal/termsofuse.php' },
  { keys: ['appium-uiautomator2-driver', 'appium-xcuitest-driver'], name: 'Appium', url: null },
];
