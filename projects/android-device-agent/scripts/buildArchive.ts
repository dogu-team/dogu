import { buildAndroidRelease } from './buildAndroidRelease';
import { checkBuildEnv } from './checkBuildenv';

// if (ci.isCI()) {
//   if (!git.matchesChangedFiles(['projects/device-agent/**', 'prebuilds/protocol-exporter/**'])) {
//     console.log('No changes to android device-agent, skipping build.');
//     process.exit(0);
//   }
// }

if (!checkBuildEnv()) {
  process.exit(1);
}
buildAndroidRelease();
