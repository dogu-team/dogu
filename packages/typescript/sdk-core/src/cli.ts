#!/usr/bin/env node

import { DoguSdkCore } from './index.js';

async function run() {
  let doguSdkCore: DoguSdkCore | null = null;
  try {
    doguSdkCore = new DoguSdkCore();
    await doguSdkCore.open({});
  } finally {
    await doguSdkCore?.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
