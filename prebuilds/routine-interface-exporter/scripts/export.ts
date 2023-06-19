import { filesystem, time, typescript } from '@dogu-dev-private/base-build-tools';
import fs from 'fs';
import fsPromises from 'fs/promises';
import yaml from 'js-yaml';
import { compileFromFile } from 'json-schema-to-typescript';
import path from 'path';
import { cwd } from 'process';
import { promisify } from 'util';

const CURRENT_DIR = cwd();

const EXPORT_DIR = '.export';

const TYPES_DIR = path.resolve(CURRENT_DIR, '../../packages/typescript-private/types');
const ROUTINE_TYPES_DIR = `${TYPES_DIR}/src/routine`;
const GENERATED_DIR = `${ROUTINE_TYPES_DIR}/generated`;

const EXPORT_ROUTINE_JSON_SCHEMA_PATH = `${EXPORT_DIR}/routine-schema.json`;
const EXPORT_ROUTINE_INTERFACE_DIR = `${GENERATED_DIR}/ts`;
const EXPORT_ROUTINE_INTERFACE_PATH = `${EXPORT_ROUTINE_INTERFACE_DIR}/schema.ts`;

const SRC_ROUTINE_YAML_SCHEMA_PATH = `${CURRENT_DIR}/yaml/routine-schema.yaml`;
const DEST_PIPELINE_YAML_SCHEMA_DIR = `${GENERATED_DIR}/yaml`;
const DEST_PIPELINE_YAML_SCHEMA_PATH = `${DEST_PIPELINE_YAML_SCHEMA_DIR}/schema.yaml`;

async function prepare(): Promise<void> {
  await filesystem.deleteDirs([EXPORT_DIR]);
  await filesystem.createDirs([EXPORT_DIR, EXPORT_ROUTINE_INTERFACE_DIR]);
}

async function exportJsonSchema(): Promise<void> {
  // load yaml schema
  const readFileAsync = promisify(fs.readFile);
  const yamlSchemaString = await readFileAsync(SRC_ROUTINE_YAML_SCHEMA_PATH, 'utf8');

  const schemaDoc = yaml.load(yamlSchemaString, {
    schema: yaml.DEFAULT_SCHEMA,
  }) as JSON;

  // write json schema
  const writeFileAsync = promisify(fs.writeFile);
  try {
    await writeFileAsync(EXPORT_ROUTINE_JSON_SCHEMA_PATH, JSON.stringify(schemaDoc));
  } catch (e) {
    console.error(e);
  }
}

async function exportSchemaInterface(): Promise<void> {
  try {
    const makedSchema = await compileFromFile(EXPORT_ROUTINE_JSON_SCHEMA_PATH, {
      unreachableDefinitions: true,
      style: {
        singleQuote: true,
        printWidth: 200,
      },
    });
    const writeFileAsync = promisify(fs.writeFile);
    await writeFileAsync(EXPORT_ROUTINE_INTERFACE_PATH, makedSchema);
    console.log('sucess');
  } catch (e) {
    console.error(e);
    console.log('error');
  }
}

async function copyPipelineYamlSchema(): Promise<void> {
  await fsPromises.cp(SRC_ROUTINE_YAML_SCHEMA_PATH, DEST_PIPELINE_YAML_SCHEMA_PATH);
}

async function createSchemaInterfaceIndexTs(): Promise<void> {
  await typescript.createIndexTsInternal(EXPORT_ROUTINE_INTERFACE_DIR, {});
}

async function createPipelineYamlSchemaIndexTs(): Promise<void> {
  // DEST_PIPELINE_YAML_SCHEMA_DIR/index.ts 생성 후 파일에 PIPELINE_YAML_SCHEMA_PATH= __dirname + /schema.yaml'; 작성
  const indexTsPath = `${DEST_PIPELINE_YAML_SCHEMA_DIR}/index.ts`;
  // eslint-disable-next-line @typescript-eslint/quotes
  const indexTsContent = "export const ROUTINE_YAML_SCHEMA_PATH = __dirname + '/schema.yaml';";
  await fsPromises.writeFile(indexTsPath, indexTsContent);
}

async function createGeneratedDirIndexTs(): Promise<void> {
  await typescript.createIndexTsInternal(GENERATED_DIR, {});
}

async function createPipelineDirIndexTs(): Promise<void> {
  await typescript.createIndexTsInternal(ROUTINE_TYPES_DIR, {});
}

async function run(): Promise<void> {
  await time.checkTime('prepare', prepare());
  await time.checkTime('exportJsonSchema', exportJsonSchema());
  await time.checkTime('exportSchemaInterface', exportSchemaInterface());
  await time.checkTime('createPipelineDirIndexTs', createPipelineDirIndexTs());
  await time.checkTime('copyPipelineYamlSchema', copyPipelineYamlSchema());

  // 마지막에 실행해야한다.
  await time.checkTime('createPipelineYamlSchemaIndexTs', createPipelineYamlSchemaIndexTs());
}

async function main(): Promise<void> {
  await time.checkTime('run', run());
}

main().catch((reason) => {
  console.error(reason);
  process.exit(1);
});
