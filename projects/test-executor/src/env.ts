declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_CLOUD_RUN: string | undefined;
      MAX_PARALLEL: string | undefined;
      EXECUTOR_NAME: string;
    }
  }
}

export {};
