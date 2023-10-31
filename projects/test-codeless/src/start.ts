import '../env';

import path from 'path';
import { Service } from './services/service';
import { WebResponsiveService } from './services/webResponsiveService';

interface ServiceMap {
  [name: string]: Service;
}

type ServiceName = keyof ServiceMap;

(async () => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = `${path.join(__dirname, '../dogu-project-379607-f41da1c1d175.json')}`;
  process.env.ORGANIZATION_ID = 'dogu-project-379607';
  process.env.URL = 'https://gixpert.com/';

  const serviceName: ServiceName = process.argv[2] as ServiceName;

  const services: ServiceMap = {
    responsive: new Service('responsive', WebResponsiveService.run),
  };

  await services[serviceName].run();
})();
