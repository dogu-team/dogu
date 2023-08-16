#!/usr/bin/env node

import { SdkCore } from './index.js';

async function main() {
  let sdk: SdkCore | null = null;
  try {
    sdk = new SdkCore();
    await sdk.open();
  } finally {
    await sdk?.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
