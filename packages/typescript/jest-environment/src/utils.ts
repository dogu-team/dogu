function prefix(message: any): string {
  return `[dogu-jest-environment] ${JSON.stringify(message)}`;
}

export const logger = {
  info: (message: any, ...args: any[]): void => console.log(prefix(message), ...args),
  error: (message: any, ...args: any[]): void => console.error(prefix(message), ...args),
  warn: (message: any, ...args: any[]): void => console.warn(prefix(message), ...args),
};
