import os from 'os';
import path from 'path';

const platform = os.platform();
const extension = platform === 'win32' ? '.exe' : '';

export const BinaryPath = {
  // Java: path.resolve(__dirname, `${platform}/jdk-20-aarch64/Contents/Home/bin/java`),
  // AXMLPrinter: path.resolve(__dirname, '../../../../src/sdk/binary/common/AXMLPrinter2.jar'),
  /**
   * @note henry - windows aapt2 from android-sdk-build-tools-33.0.2
   */
  Aapt: path.resolve(__dirname, `../../../../src/sdk/binary/${platform}/aapt2${extension}`),
};
