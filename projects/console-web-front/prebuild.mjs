import fs from 'fs';
import packageJson from './package.json' assert { type: 'json' };

const version = packageJson.version;

const envLine = `NEXT_PUBLIC_DOGU_VERSION=${version}\n`;

let envContent = '';
let isLocalEnvExist = true;

if (fs.existsSync('.env.local')) {
  envContent = fs.readFileSync('.env.local', 'utf-8');
} else if (fs.existsSync('.env')) {
  isLocalEnvExist = false;
  envContent = fs.readFileSync('.env', 'utf-8');
} else {
  throw new Error('No env file found.');
}

const envLines = envContent.split('\n');
const existingEnvLineIndex = envLines.findIndex((line) => line.startsWith('NEXT_PUBLIC_DOGU_VERSION'));

const updatedEnvLines =
  existingEnvLineIndex === -1
    ? [...envLines, envLine]
    : envLines.map((line) => {
        if (line.startsWith('NEXT_PUBLIC_DOGU_VERSION')) {
          return envLine;
        }
        return line;
      });

fs.writeFileSync(isLocalEnvExist ? '.env.local' : '.env', updatedEnvLines.join('\n'));

console.log('Env updated successfully.');
