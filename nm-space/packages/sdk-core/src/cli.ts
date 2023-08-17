#!/usr/bin/env node

import { Runner } from './index.js';

async function main(): Promise<void> {
  const runner = new Runner();
  await runner.run();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
