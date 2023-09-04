import { TutorialSupportSdk } from '.';

export interface RoutineTutorialDetailData {}

export interface RoutineTutorial {}

export const routineTutorialData: { [key in TutorialSupportSdk]: RoutineTutorialDetailData } = {
  [TutorialSupportSdk.APPIUM]: {},
  [TutorialSupportSdk.WEBDRIVERIO]: {},
  [TutorialSupportSdk.SELENIUM]: {},
  [TutorialSupportSdk.GAMIUM]: {},
};
