import { buildDesktopCapturer } from './buildDesktopCapturer';
import { buildGoDeviceController } from './buildGoDeviceController';

(async (): Promise<void> => {
  // if (ci.isCI()) {
  //   if (!git.matchesChangedFiles(['projects/go-device-controller/**', 'prebuilds/protocol-exporter/**'])) {
  //     console.log('No changes to go-device-controller, skipping build.');
  //     return;
  //   }
  // }
  await buildDesktopCapturer();
  await buildGoDeviceController();
})().catch((reason: Error) => {
  console.error(reason);
  process.exit(1);
});
