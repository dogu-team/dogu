import shelljs from 'shelljs';
import { config } from '../../src/config';

shelljs.exec(`cross-env TZ=UTC yarn typeorm migration:create ./src/db/migrations/${config.runType}/typeorm-migration`);
