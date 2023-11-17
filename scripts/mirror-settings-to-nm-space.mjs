import fs from 'fs';
import path from 'path';

const sources = ['.editorconfig', '.eslintignore', '.prettierignore', '.prettierrc.json'];
const destRoots = ['nm-space', 'nm-space/projects/dost'];

async function main() {
  for (const destRoot of destRoots) {
    for (const source of sources) {
      const dest = path.join(destRoot, source);
      console.log(`Copying ${source} to ${dest}`);
      await fs.promises.cp(source, dest, { recursive: true, force: true });
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
