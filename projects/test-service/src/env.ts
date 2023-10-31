declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // common
      ORGANIZATION_ID: string;
    }
  }
}

export {};
