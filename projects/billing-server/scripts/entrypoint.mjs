import { execSync } from 'child_process';

console.log('Start DB migration');
execSync('yarn run typeorm:init', { stdio: 'inherit' });

console.log('Start Server');
execSync('yarn run start', { stdio: 'inherit' });
