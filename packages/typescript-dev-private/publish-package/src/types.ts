export interface PartialPackageJson {
  name?: string;
  version?: string;
  dependencies?: {
    [packageName: string]: string;
  };
  devDependencies?: {
    [packageName: string]: string;
  };
}
