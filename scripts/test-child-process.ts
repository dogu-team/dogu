import { spawn } from 'child_process';

// xcodebuild test-without-building -xctestrun /Users/dogu/repo/dogu/third-party/darwin/common/ios-device-agent/runspaces/00008020-000C748A3A63002E/Products/DoguRunner_iphoneos16.2-arm64.xctestrun -destination id=00008020-000C748A3A63002E -resultBundlePath /var/folders/kr/_9tm9yfs6rl310pv34kxlfh00000gn/T/dogu-xctest/19412//34e79e32-2bc4-4651-936f-85e06b7ab6f2
const xctest = spawn('xcodebuild', [
  'test-without-building',
  '-xctestrun',
  '/Users/dogu/repo/dogu/third-party/darwin/common/ios-device-agent/runspaces/00008020-000C748A3A63002E/Products/DoguRunner_iphoneos16.2-arm64.xctestrun',
  '-destination',
  'id=00008020-000C748A3A63002E',
  '-resultBundlePath',
  '/Users/dogu/repo/dogu/.temp/xctest',
]);
xctest.on('spawn', () => {
  console.log('xctest spawn');
});
xctest.on('error', (err) => {
  console.log('xctest error', err);
});
xctest.on('close', (code, signal) => {
  console.log('xctest close', code, signal);
});
xctest.stdout.setEncoding('utf8');
xctest.stdout.on('data', (data) => {
  console.log('xctest stdout', data);
});
xctest.stderr.setEncoding('utf8');
xctest.stderr.on('data', (data) => {
  console.log('xctest stderr', data);
});

const tunnel = spawn('mobiledevice', ['tunnel', '-u', '00008020-000C748A3A63002E', '30018', '30018']);
tunnel.on('spawn', () => {
  console.log('tunnel spawn');
});
tunnel.on('error', (err) => {
  console.log('tunnel error', err);
});
tunnel.on('close', (code, signal) => {
  console.log('tunnel close', code, signal);
});
tunnel.stdout.setEncoding('utf8');
tunnel.stdout.on('data', (data) => {
  console.log('tunnel stdout', data);
});
tunnel.stderr.setEncoding('utf8');
tunnel.stderr.on('data', (data) => {
  console.log('tunnel stderr', data);
});

setInterval(() => {
  console.log('interval');
}, 1000);
