import fg from 'fast-glob';
import shelljs from 'shelljs';

function findEggInfos(): Promise<string[]> {
  return fg(`**/*.egg-info`, { dot: true, onlyFiles: false });
}

function findPyCaches(): Promise<string[]> {
  return fg(`**/__pycache__`, { dot: true, onlyFiles: false });
}

async function main(): Promise<void> {
  const files = ['dist', 'build', ...(await findEggInfos()), ...(await findPyCaches())];
  files.forEach((file) => {
    if (shelljs.rm('-rf', file).code !== 0) {
      throw new Error(`Failed to remove ${file}`);
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
