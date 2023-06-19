import shelljs from 'shelljs';
import { env } from '../../src/env';

shelljs.exec(`cross-env TZ=UTC yarn typeorm migration:generate ./src/db/migrations/${env.DOGU_RUN_TYPE}/typeorm-migration -d ./src/migration.config.ts`);
