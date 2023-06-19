export interface LatestYamlDownloadParseResult {
  files: {
    url: string;
    size: number;
    sha512: string;
  }[];
  path: string;
  releaseDate: string;
  sha512: string;
  version: string;
}
