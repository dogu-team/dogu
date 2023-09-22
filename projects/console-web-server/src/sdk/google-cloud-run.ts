import { protos, v2 } from '@google-cloud/run';
import { google } from '@google-cloud/run/build/protos/protos';
const { ServicesClient } = v2;

// INPUT_ENV
const DOGU_HOST_TOKEN = 'HOSTTOKEN';
const DOGU_API_BASE_URL = '!!!!!@#@@@';

// CONSOLE_ENV
// FIXME:(felix) env val
const SERVICE_ACCOUNT_KEY_STRING = 'SERVICE_ACCOUNT_KEY_STRING';
const SERVICE_ACCOUNT_KEY = JSON.parse(SERVICE_ACCOUNT_KEY_STRING);

const HOST_IMAGE_URL = 'gcr.io/dogu-project/test';
const GCP_PROJECT_ID = 'dogu-project';
const GCP_REGION = 'asia-northeast3';
const GCR_PORT = 8080;
const GCR_CPU = '1';
const GCR_MEMORY = '512Mi';
const GCR_CONCURRENCY = 80;
const GCR_TIMEOUT_SECOND = 30;
const GCR_SERVICE_ACCOUNT = 'SERVICE_ACCOUNT_NAME';

const servicesClient = new ServicesClient({
  credentials: SERVICE_ACCOUNT_KEY,
  projectId: GCP_PROJECT_ID,
});

const PARENT_PATH = `projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}`;
const SERVICE_PORT = {
  name: 'http1',
  containerPort: GCR_PORT,
};
const CONTAINER_ENVS: google.cloud.run.v2.IEnvVar[] = [
  {
    name: 'DOGU_HOST_TOKEN',
    value: DOGU_HOST_TOKEN,
  },
  {
    name: 'DOGU_API_BASE_URL',
    value: DOGU_API_BASE_URL,
  },
];

const RESOURCE_CONFIG: google.cloud.run.v2.IResourceRequirements = {
  limits: {
    cpu: GCR_CPU,
    memory: GCR_MEMORY,
  },
};

const CONTIANER_CONFIG: google.cloud.run.v2.IContainer = {
  image: HOST_IMAGE_URL,
  ports: [SERVICE_PORT],
  env: CONTAINER_ENVS,
  resources: RESOURCE_CONFIG,
};

const SERVICE_CONFIG: google.cloud.run.v2.IService = {
  template: {
    containers: [CONTIANER_CONFIG],
    serviceAccount: GCR_SERVICE_ACCOUNT,
    timeout: {
      seconds: GCR_TIMEOUT_SECOND,
    },
    scaling: {
      maxInstanceCount: 1,
      minInstanceCount: 1,
    },
    sessionAffinity: null,
    maxInstanceRequestConcurrency: GCR_CONCURRENCY,
  },
};

export module GoogleCloudRun {
  function getResourcePath(serviceName: string): string {
    return `projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/services/${serviceName}`;
  }

  export async function runService(serviceName: string) {
    const request: protos.google.cloud.run.v2.ICreateServiceRequest = {
      parent: PARENT_PATH,
      service: SERVICE_CONFIG,
      serviceId: serviceName,
    };

    const policy = await servicesClient.getIamPolicy({
      resource: getResourcePath(serviceName),
    });

    policy[0].bindings = [
      {
        role: 'roles/run.invoker',
        members: ['allUsers'],
      },
    ];

    const rv = await servicesClient.createService(request);
    const setPolicy = await servicesClient.setIamPolicy({
      resource: getResourcePath(serviceName),
      policy: policy[0],
    });

    const ser = await servicesClient.getService({
      name: getResourcePath(serviceName),
    });
  }

  export async function deleteService(serviceName: string) {
    const request: protos.google.cloud.run.v2.IDeleteServiceRequest = {
      name: getResourcePath(serviceName),
    };
    const options = {
      maxRetries: 3,
    };

    const service = await servicesClient.getService(request);
    if (!service) {
      throw new Error('service not found');
    }

    await servicesClient.deleteService(request, options);
    return;
  }
}
