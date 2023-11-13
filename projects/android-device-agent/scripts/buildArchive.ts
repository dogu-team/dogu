import { android } from '@dogu-dev-private/build-tools';
import { buildAndroidRelease } from './buildAndroidRelease';

if (process.platform === 'linux') {
  console.log('Skipping android build on linux.');
  process.exit(0);
}

// if (ci.isCI()) {
//   if (!git.matchesChangedFiles(['projects/device-agent/**', 'prebuilds/protocol-exporter/**'])) {
//     console.log('No changes to android device-agent, skipping build.');
//     process.exit(0);
//   }
// }

if (!android.checkBuildEnv()) {
  process.exit(1);
}
buildAndroidRelease();
