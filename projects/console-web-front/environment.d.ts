declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DOGU_RUN_TYPE: 'development' | 'production' | 'test' | 'local' | 'staging' | 'e2e' | 'self-hosted';
      NEXT_PUBLIC_DOGU_API_BASE_URL: string;
      NEXT_PUBLIC_DOGU_WS_BASE_URL: string;
      NEXT_PUBLIC_ENV: 'development' | 'production' | 'test' | 'local' | 'staging' | 'e2e' | 'self-hosted';
      NEXT_PUBLIC_DOGU_RECAPTCHA_SITE: string;
      NEXT_PUBLIC_DOGU_GA_ID: string;
      NEXT_PUBLIC_DOGU_GTM_ID: string;
      NEXT_PUBLIC_SENTRY_DSN: string | undefined;
      NEXT_PUBLIC_DOGU_TURN_HOST: string;
      NEXT_PUBLIC_DOGU_TURN_PORT: string;
      NEXT_PUBLIC_TURN_SERVER_USERNAME: string;
      NEXT_PUBLIC_TURN_SERVER_PASSWORD: string;
      NEXT_PUBLIC_TURN_SERVER_CREDENTIAL_TYPE: 'password';
      NEXT_PUBLIC_LANDING_URL: string | undefined;
      NEXT_PUBLIC_DOGU_VERSION: string;
    }
  }
}

export {};
