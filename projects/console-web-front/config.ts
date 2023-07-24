export const config = {
  turnServer: {
    userName: process.env.NEXT_PUBLIC_TURN_SERVER_USERNAME,
    password: process.env.NEXT_PUBLIC_TURN_SERVER_PASSWORD,
    credentialType: process.env.NEXT_PUBLIC_TURN_SERVER_CREDENTIAL_TYPE,
    host: process.env.NEXT_PUBLIC_TURN_SERVER_HOST,
    port: process.env.NEXT_PUBLIC_TURN_SERVER_PORT,
    url: `turn:${process.env.NEXT_PUBLIC_TURN_SERVER_HOST}:${process.env.NEXT_PUBLIC_TURN_SERVER_PORT}`,
  },
};
