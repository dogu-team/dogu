import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const USER_TOKEN_KEY = 'USER_TOKEN';
const USER_TOKEN_OPTION: SecuritySchemeObject = {
  type: 'http',
  scheme: 'bearer',
  description: 'user jwt 입력하세요.',
  name: 'user-jwt',
  in: 'header',
};

export const HOST_TOKEN_KEY = 'HOST_TOKEN';
const HOST_TOKEN_OPTION: SecuritySchemeObject = {
  type: 'http',
  scheme: 'bearer',
  description: 'host jwt 입력하세요.',
  name: 'host-jwt',
  in: 'header',
};

export const ORGANIZATION_TOKEN_KEY = 'ORGANIZATION_TOKEN';
const ORGANIZATION_TOKEN_OPTION: SecuritySchemeObject = {
  type: 'http',
  scheme: 'bearer',
  description: 'organization jwt 입력하세요.',
  name: 'organization-jwt',
  in: 'header',
};

export const SWAGER_OPTION = new DocumentBuilder()
  .setTitle('Console')
  .setDescription('Console API')
  .setVersion('1.0.0')
  .addBearerAuth(USER_TOKEN_OPTION, USER_TOKEN_KEY)
  .addBearerAuth(HOST_TOKEN_OPTION, HOST_TOKEN_KEY)
  .addBearerAuth(ORGANIZATION_TOKEN_OPTION, ORGANIZATION_TOKEN_KEY)
  .build();

const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
};

interface API_PATH_INFO {
  path: string;
  method: string;
  controller: string;
  action: string;
}

export const ApiPathInfos: API_PATH_INFO[] = [];

export function setupSwagger(app: INestApplication): void {
  // const document = SwaggerModule.createDocument(app, SWAGER_OPTION);
  // SwaggerModule.setup('api', app, document, swaggerCustomOptions);
  // const urlPathItems: [string, PathItemObject][] = Object.entries(document.paths);
  // urlPathItems.map((pathItem) => {
  //   const path = pathItem[0];
  //   const method = Object.keys(pathItem[1])[0];
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //   const [controller, action] = (pathItem[1][method]['operationId'] as string).split('_');
  //   ApiPathInfos.push({ path, method, controller, action });
  // });
  // NOTE(henry): 💡 comment out
  // logger.info(ApiPathInfos);
}
