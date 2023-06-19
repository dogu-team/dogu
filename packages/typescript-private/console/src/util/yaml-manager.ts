import yaml from 'js-yaml';

export class YamlManager {
  public static parseYaml<T>(yamlRaw: string, options?: yaml.LoadOptions): T {
    const parsedYaml = yaml.load(yamlRaw, options);
    return parsedYaml as T;
  }

  public static dumpToYaml<T>(data: T, options?: yaml.DumpOptions): string {
    return yaml.dump(data, options);
  }
}
