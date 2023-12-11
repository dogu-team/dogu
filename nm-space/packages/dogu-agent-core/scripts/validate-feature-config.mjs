import { validateEveryRunTypePropertyEqualitySync } from '@dogu-tech/node';

validateEveryRunTypePropertyEqualitySync('src/app/feature-config');
console.log('All dogu-agent-core feature config properties are equal across all run types.');
