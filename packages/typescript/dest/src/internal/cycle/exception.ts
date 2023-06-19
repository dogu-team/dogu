export class Exception {
  public readonly scope: string;
  public readonly message: string;
  public readonly fileLocation: string;
  public readonly callStack: string;
  public readonly error?: Error;
  public readonly cause?: Exception;

  constructor(scope: string, message: string, error: Error | undefined) {
    this.error = error;
    this.callStack = this.error?.stack ?? '';
    if (this.error?.cause) {
      this.cause = new Exception(scope, this.error?.cause.message, this.error?.cause);
    }

    this.scope = scope;
    this.message = message;
    this.fileLocation = this.getFileLocation();
  }

  private getFileLocation(): string {
    const lines = this.callStack.split('    at ');
    const line = lines[2];
    if (line === undefined) {
      return 'unknown';
    }

    const parseLocation = (location: string): string => {
      let [, filePath] = location.split(' (');
      if (filePath === undefined) {
        return 'unknown';
      }
      filePath = filePath.substring(0, filePath.length - 2);
      return filePath;
    };

    return parseLocation(line);
  }
}
