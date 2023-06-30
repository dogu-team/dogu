#!/bin/bash
frontEnvFilename='.env'
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Current Path: $SCRIPT_DIR"
envFilePath=$SCRIPT_DIR/projects/console-web-front/$frontEnvFilename

# check if .env file exists
if [ ! -f "$envFilePath" ]; then
  echo "Creating .env file"
  touch $envFilePath
fi

# add env variables to .env file
sed -i "s/^NEXT_PUBLIC_TURN_SERVER_USERNAME=.*$/NEXT_PUBLIC_TURN_SERVER_USERNAME=$NEXT_PUBLIC_TURN_SERVER_USERNAME/" $envFilePath
sed -i "s/^NEXT_PUBLIC_TURN_SERVER_PASSWORD=.*$/NEXT_PUBLIC_TURN_SERVER_PASSWORD=$NEXT_PUBLIC_TURN_SERVER_USERNAME/" $envFilePath
sed -i "s/^NEXT_PUBLIC_DOGU_GITLAB_HOST=.*$/NEXT_PUBLIC_DOGU_GITLAB_HOST=$NEXT_PUBLIC_DOGU_GITLAB_HOST/" $envFilePath
sed -i "s/^NEXT_PUBLIC_DOGU_API_BASE_URL=.*$/NEXT_PUBLIC_DOGU_API_BASE_URL=$NEXT_PUBLIC_DOGU_API_BASE_URL" $envFilePath
sed -i "s/^NEXT_PUBLIC_DOGU_WS_BASE_URL=.*$/NEXT_PUBLIC_DOGU_WS_BASE_URL=$NEXT_PUBLIC_DOGU_WS_BASE_URL" $envFilePath
sed -i "s/^NEXT_PUBLIC_TURN_SERVER_HOST=.*$/NEXT_PUBLIC_TURN_SERVER_HOST=$NEXT_PUBLIC_TURN_SERVER_HOST/" $envFilePath
sed -i "s/^NEXT_PUBLIC_ENV=.*$/NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV/" $envFilePath
sed -i "s/^NEXT_PUBLIC_LANDING_URL=.*$/NEXT_PUBLIC_LANDING_URL=$NEXT_PUBLIC_LANDING_URL/" $envFilePath
sed -i "s/^NEXT_PUBLIC_DOGU_GA_ID=.*$/NEXT_PUBLIC_DOGU_GA_ID=$NEXT_PUBLIC_DOGU_GA_ID/" $envFilePath
sed -i "s/^NEXT_PUBLIC_SENTRY_DSN=.*$/NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN/" $envFilePath
sed -i "s/^NEXT_PUBLIC_DOGU_GITLAB_PORT=.*$/NEXT_PUBLIC_DOGU_GITLAB_PORT=$NEXT_PUBLIC_DOGU_GITLAB_PORT/" $envFilePath
sed -i "s/^NEXT_PUBLIC_DOGU_GITLAB_PROTOCOL=.*$/NEXT_PUBLIC_DOGU_GITLAB_PROTOCOL=$NEXT_PUBLIC_DOGU_GITLAB_PROTOCOL/" $envFilePath


echo "Start nextjs build"
yarn workspace console-web-front run build 

echo "Start db migration"
yarn workspace console-web-server run typeorm:init

echo "Start file server initialization"
yarn workspace nexus-initializer run start

echo "Start console"
yarn run start:console

exec "$@"
