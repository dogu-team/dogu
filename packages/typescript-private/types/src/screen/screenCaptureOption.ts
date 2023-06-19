import { ScreenCaptureOption } from '../protocol/generated/tsproto/outer/streaming/screencapture_option';

export const DefaultScreenCaptureOption: () => ScreenCaptureOption = () => {
  return {
    bitRate: 8000000,
    maxFps: 60,
    frameRate: 60,
    frameInterval: 1,
    repeatFrameDelay: 100000,
    maxResolution: 720,
  };
};
