import shelljs from 'shelljs';
import { config } from '../../src/config';

shelljs.exec(`cross-env TZ=UTC yarn typeorm migration:generate ./src/db/migrations/${config.runType}/typeorm-migration -d ./src/migration.config.ts`);
