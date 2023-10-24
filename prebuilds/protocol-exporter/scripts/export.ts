import { filesystem, process as buildToolsProcess, time, typescript } from '@dogu-dev-private/base-build-tools';
import { findFiles } from '@dogu-dev-private/base-build-tools/src/filesystem';
import fsPromises from 'fs/promises';
import path from 'path';
import { cwd } from 'process';
import { Md5 } from 'ts-md5';
import { config } from './config';
import { goExporter, tsExporter } from './env';
import { ParseOptions } from './env/common';
import { GoCreationOptions } from './env/go';
import { TsCreationOptions } from './env/ts';

const CURRENT_DIR = cwd();
const PROTO_DIR = 'proto';
const PROTO_OUTER_DIR = `${PROTO_DIR}/outer`;
const ENV_DIR = 'env';
const PROTOCOL_VERSION_ENV = `${ENV_DIR}/protocol-version.env`;

const EXPORT_DIR = '.export';
const EXPORT_GO_DIR = `${EXPORT_DIR}/go`;
const EXPORT_GO_PROTO_DIR = `${EXPORT_GO_DIR}/proto`;
const EXPORT_GO_ENV_DIR = `${EXPORT_GO_DIR}/env`;

const OUTER_TS_EXPORT_CONTEXT: ExportTsContext = {
  dir: `${EXPORT_DIR}/typescript`,
  envDir: `${EXPORT_DIR}/typescript/env`,
  tsProtoDir: `${EXPORT_DIR}/typescript/tsproto`,
  buildTsConfigPath: `${CURRENT_DIR}/tsconfig.exported-ts.public.json`,
  buildTsInfoPath: `${CURRENT_DIR}/tsconfig.exported-ts.public.tsbuildinfo`,
  buildOutputDir: `${EXPORT_DIR}/typescript-build`,
  destDir: `${CURRENT_DIR}/../../packages/typescript/types/src/protocol/generated`,
};

const INNER_TS_EXPORT_CONTEXT: ExportTsContext = {
  dir: `${EXPORT_DIR}/typescript-private`,
  envDir: `${EXPORT_DIR}/typescript-private/env`,
  tsProtoDir: `${EXPORT_DIR}/typescript-private/tsproto`,
  buildTsConfigPath: `${CURRENT_DIR}/tsconfig.exported-ts.private.json`,
  buildTsInfoPath: `${CURRENT_DIR}/tsconfig.exported-ts.private.tsbuildinfo`,
  buildOutputDir: `${EXPORT_DIR}/typescript-private-build`,
  destDir: `${CURRENT_DIR}/../../packages/typescript-private/types/src/protocol/generated`,
};

const EXPORT_JAVA_DIR = `${EXPORT_DIR}/java`;
const EXPORT_KOTLIN_DIR = `${EXPORT_DIR}/kotlin`;
const EXPORT_SWIFT_DIR = `${EXPORT_DIR}/swift`;

const DOCKER_WORK_DIR = '/app/host';

const DEST_GO_TYPES_DIR = `${CURRENT_DIR}/../../projects/go-device-controller/types/protocol/generated`;
const DEST_DEVICE_AGENT_ANDROID_JAVA_DIR = `${CURRENT_DIR}/../../projects/android-device-agent/android/app/src/main/java/`;
const DEST_DEVICE_AGENT_ANDROID_KOTLIN_DIR = `${CURRENT_DIR}/../../projects/android-device-agent/android/app/src/main/kotlin/`;
const DEST_SWIFT_TYPES_DIR = `${CURRENT_DIR}/../../projects/ios-device-agent/IOSDeviceAgent/IOSDeviceAgentLib/DoguTypes/protocol/generated`;

interface ExportTsContext {
  dir: string;
  envDir: string;
  tsProtoDir: string;
  buildTsConfigPath: string;
  buildTsInfoPath: string;
  buildOutputDir: string;
  destDir: string;
}

async function prepare(): Promise<void> {
  await filesystem.deleteDirs([EXPORT_DIR]);
  await filesystem.createDirs([EXPORT_GO_DIR, EXPORT_JAVA_DIR, EXPORT_KOTLIN_DIR, EXPORT_SWIFT_DIR, OUTER_TS_EXPORT_CONTEXT.dir, INNER_TS_EXPORT_CONTEXT.dir]);
}

async function pullExporter(): Promise<void> {
  return buildToolsProcess.createProcess(`${config.aws.loginCommand()} && docker pull ${config.docker.imageName()}`);
}

async function runExporter(): Promise<void> {
  try {
    await buildToolsProcess.createProcess(`docker rm -f ${config.docker.containerName}`);
  } catch (error) {
    console.warn(error);
  }
  return buildToolsProcess.createProcess(
    `docker run -di --volume=${CURRENT_DIR}:${DOCKER_WORK_DIR} --workdir=${DOCKER_WORK_DIR} --name=${config.docker.containerName} ${config.docker.imageName()} bash`,
  );
}

async function createProtocolVersionEnv(protos: string[]): Promise<void> {
  const fileContents = await Promise.all(protos.map((proto) => fsPromises.readFile(proto, 'utf8')));
  const protoVersion = Md5.hashStr(fileContents.join(''));
  console.info(`Protocol version: ${protoVersion}`);
  console.warn(`Overwriting ${PROTOCOL_VERSION_ENV}`);
  await fsPromises.mkdir(ENV_DIR, { recursive: true });
  return fsPromises.writeFile(PROTOCOL_VERSION_ENV, `DOGU_PROTOCOL_VERSION=${protoVersion}`);
}

async function formatProto(): Promise<void> {
  return buildToolsProcess.createProcess(`docker run --rm --volume=${CURRENT_DIR}:${DOCKER_WORK_DIR} --workdir=${DOCKER_WORK_DIR} yoheimuta/protolint lint -fix ${PROTO_DIR}`);
}

async function findProtos(dir: string): Promise<string[]> {
  return await filesystem.findFiles(dir, '.proto');
}

async function findEnvs(): Promise<string[]> {
  return await filesystem.findFiles(ENV_DIR, '.env');
}

async function exportGoJavaKotlinSwift(protos: string[]): Promise<void> {
  await filesystem.createDirs([EXPORT_GO_PROTO_DIR]);
  await buildToolsProcess.createProcess(
    `docker exec ${
      config.docker.containerName
    } /bin/bash --login -c "source /root/.bashrc && protoc --proto_path=${PROTO_DIR} --go_out=${EXPORT_GO_PROTO_DIR} --go_opt=paths=source_relative --go-grpc_out=${EXPORT_GO_PROTO_DIR} --go-grpc_opt=paths=source_relative --java_out=lite:${EXPORT_JAVA_DIR} --kotlin_out=${EXPORT_KOTLIN_DIR} --swift_out=${EXPORT_SWIFT_DIR} --grpc-swift_out=${EXPORT_SWIFT_DIR} --swift_opt=FileNaming=PathToUnderscores --grpc-swift_opt=FileNaming=PathToUnderscores --swift_opt=Visibility=Public --grpc-swift_opt=Visibility=Public ${protos.join(
      ' ',
    )}"`,
  );
  const swiftFiles = await findFiles(path.resolve(CURRENT_DIR, EXPORT_SWIFT_DIR), '.swift');
  const tobeRemovedFiles = swiftFiles.filter((file) => path.basename(file).startsWith('inner_grpc_services'));
  for (const removedFile of tobeRemovedFiles) {
    await fsPromises.unlink(removedFile);
  }
}

async function exportTypeScript(protos: string[], dir: string): Promise<void> {
  await filesystem.createDirs([dir]);
  await buildToolsProcess.createProcess(
    `docker exec ${
      config.docker.containerName
    } /bin/bash --login -c "source /root/.bashrc && protoc --proto_path=${PROTO_DIR} --plugin=/app/node/node_modules/ts-proto/protoc-gen-ts_proto --ts_proto_opt=esModuleInterop=true --ts_proto_out=${dir} --ts_proto_opt=env=both --ts_proto_opt=forceLong=number --ts_proto_opt=outputClientImpl=false --ts_proto_opt=returnObservable=false --ts_proto_opt=useOptionals=none --ts_proto_opt=outputServices=grpc-js --ts_proto_opt=oneof=unions --ts_proto_opt=exportCommonSymbols=false ${protos.join(
      ' ',
    )}"`,
  );
  return buildToolsProcess.createProcess(`prettier --loglevel warn --write ${dir}`);
}

async function createIndexTs(dir: string): Promise<void> {
  const currentDir = process.cwd();
  process.chdir(dir);
  await typescript.createIndexTsInternal('.', {
    dirPostFixExclude: ['grpc'],
    filePostFixExclude: ['.d.ts'],
  });
  process.chdir(currentDir);
}

async function buildTs(context: ExportTsContext): Promise<void> {
  await fsPromises.rm(context.buildTsInfoPath, { force: true });
  await buildToolsProcess.createProcess(`yarn run -- tsc -p ${context.buildTsConfigPath}`);
  await fsPromises.rename(context.dir, `${context.dir}-src`);
  await fsPromises.rename(context.buildOutputDir, context.dir);
}

async function exportEnvToTs(envs: string[], dir: string): Promise<void> {
  await filesystem.createDirs([dir]);
  const parseOptions: ParseOptions = {};
  const tsCreationOptions: TsCreationOptions = {};
  const promises = envs.map(async (env) => {
    return tsExporter.export(env, dir, parseOptions, tsCreationOptions);
  });
  await Promise.all(promises);
  return buildToolsProcess.createProcess(`prettier --loglevel warn --write ${dir}`);
}

async function exportEnvToGo(envs: string[]): Promise<void> {
  await filesystem.createDirs([EXPORT_GO_ENV_DIR]);
  const parseOptions: ParseOptions = {};
  const goCreationOptions: GoCreationOptions = {
    packageName: 'env',
  };
  const promises = envs.map(async (env) => {
    return goExporter.export(env, EXPORT_GO_ENV_DIR, parseOptions, goCreationOptions);
  });
  await Promise.all(promises);
}

async function copyToProjects(): Promise<void> {
  await filesystem.deleteDirs([
    DEST_GO_TYPES_DIR,
    OUTER_TS_EXPORT_CONTEXT.destDir,
    INNER_TS_EXPORT_CONTEXT.destDir,
    `${DEST_DEVICE_AGENT_ANDROID_JAVA_DIR}/com/dogu/protocol/generated`,
    `${DEST_DEVICE_AGENT_ANDROID_KOTLIN_DIR}/com/dogu//protocol/generated`,
    DEST_SWIFT_TYPES_DIR,
  ]);
  await Promise.all([
    fsPromises.cp(EXPORT_GO_DIR, DEST_GO_TYPES_DIR, {
      recursive: true,
    }),
    fsPromises.cp(OUTER_TS_EXPORT_CONTEXT.dir, OUTER_TS_EXPORT_CONTEXT.destDir, {
      recursive: true,
    }),
    fsPromises.cp(INNER_TS_EXPORT_CONTEXT.dir, INNER_TS_EXPORT_CONTEXT.destDir, {
      recursive: true,
    }),
    fsPromises.cp(EXPORT_JAVA_DIR, DEST_DEVICE_AGENT_ANDROID_JAVA_DIR, {
      recursive: true,
    }),
    fsPromises.cp(EXPORT_KOTLIN_DIR, DEST_DEVICE_AGENT_ANDROID_KOTLIN_DIR, {
      recursive: true,
    }),
    fsPromises.cp(EXPORT_SWIFT_DIR, DEST_SWIFT_TYPES_DIR, { recursive: true }),
  ]);
}

async function run(): Promise<void> {
  await time.checkTime('prepare', prepare());
  await time.checkTime('formatProto', formatProto());
  await time.checkTime('pullExporter', pullExporter());
  await time.checkTime('runExporter', runExporter());
  const allProtos = await findProtos(PROTO_DIR);
  const outerProtos = await findProtos(PROTO_OUTER_DIR);
  /**
   * @note call after formatProto
   */
  await time.checkTime('createProtocolVersionEnv', createProtocolVersionEnv(allProtos));

  /**
   * @note call after createProtocolVersionEnv
   */
  const envs = await findEnvs();

  await Promise.all([
    // all protos
    time.checkTime('exportGoJavaKotlinSwift', exportGoJavaKotlinSwift(allProtos)),
    time.checkTime('exportEnvToGo', exportEnvToGo(envs)),

    (async (): Promise<void> => {
      await time.checkTime('exportTypeScriptPrivate', exportTypeScript(allProtos, INNER_TS_EXPORT_CONTEXT.tsProtoDir));
      await time.checkTime('exportEnvToTsPrivate', exportEnvToTs(envs, INNER_TS_EXPORT_CONTEXT.envDir));
      await time.checkTime('createIndexTsPrivate', createIndexTs(INNER_TS_EXPORT_CONTEXT.dir));
      await time.checkTime('buildTsPrivate', buildTs(INNER_TS_EXPORT_CONTEXT));
    })(),

    // outer protos
    (async (): Promise<void> => {
      await time.checkTime('exportTypeScriptPublic', exportTypeScript(outerProtos, OUTER_TS_EXPORT_CONTEXT.tsProtoDir));
      await time.checkTime('exportEnvToTsPublic', exportEnvToTs(envs, OUTER_TS_EXPORT_CONTEXT.envDir));
      await time.checkTime('createIndexTsPublic', createIndexTs(OUTER_TS_EXPORT_CONTEXT.dir));
      await time.checkTime('buildTsPublic', buildTs(OUTER_TS_EXPORT_CONTEXT));
    })(),
  ]);

  await time.checkTime('copyToProjects', copyToProjects());
}

async function main(): Promise<void> {
  await time.checkTime('run', run());
}

main().catch((reason) => {
  console.error(reason);
  process.exit(1);
});
