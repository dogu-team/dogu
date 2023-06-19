export const config = {
  gitlab: {
    host: process.env.NEXT_PUBLIC_DOGU_GITLAB_HOST,
    port: process.env.NEXT_PUBLIC_DOGU_GITLAB_PORT,
    protocol: process.env.NEXT_PUBLIC_DOGU_GITLAB_PROTOCOL,
    url: `${process.env.NEXT_PUBLIC_DOGU_GITLAB_PROTOCOL}://${process.env.NEXT_PUBLIC_DOGU_GITLAB_HOST}:${process.env.NEXT_PUBLIC_DOGU_GITLAB_PORT}`,
  },
  turnserver: {
    userName: process.env.NEXT_PUBLIC_TURN_SERVER_USERNAME,
    password: process.env.NEXT_PUBLIC_TURN_SERVER_PASSWORD,
    credentialType: process.env.NEXT_PUBLIC_TURN_SERVER_CREDENTIAL_TYPE,
    host: process.env.NEXT_PUBLIC_TURN_SERVER_HOST,
    port: process.env.NEXT_PUBLIC_TURN_SERVER_PORT,
    url: `turn:${process.env.NEXT_PUBLIC_TURN_SERVER_HOST}:${process.env.NEXT_PUBLIC_TURN_SERVER_PORT}`,
  },
};
