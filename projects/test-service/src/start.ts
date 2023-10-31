import { promisify } from 'util';
import './env';

import { Service } from './services/service';
import { WebResponsiveService } from './services/webResponsiveService';

const wait = promisify(setTimeout);

interface ServiceMap {
  [name: string]: Service;
}

type ServiceName = keyof ServiceMap;

(async () => {
  process.env.ORGANIZATION_ID = 'dogu-project-379607';
  const serviceName: ServiceName = process.argv[2] as ServiceName;

  const services: ServiceMap = {
    responsive: new Service('responsive', WebResponsiveService.run),
  };

  await services[serviceName].run({ urls: ['https://www.naver.com'] });

  process.exit(0);
})();
