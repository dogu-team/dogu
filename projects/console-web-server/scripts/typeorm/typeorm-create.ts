import shelljs from 'shelljs';
import { env } from '../../src/env';

shelljs.exec(`cross-env TZ=UTC yarn typeorm migration:create ./src/db/migrations/${env.DOGU_RUN_TYPE}/typeorm-migration`);
