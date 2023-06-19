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
echo "NEXT_PUBLIC_TURN_SERVER_USERNAME=$TURN_SERVER_USERNAME" >> $envFilePath
echo "NEXT_PUBLIC_TURN_SERVER_PASSWORD=$TURN_SERVER_PASSWORD" >> $envFilePath
echo "NEXT_PUBLIC_DOGU_GITLAB_HOST=$GITLAB_EXPOSE_HOSTNAME" >> $envFilePath

echo "Start nextjs build"
yarn workspace console-web-front run build 

echo "Start db migration"
yarn workspace console-web-server run typeorm:init

echo "Start file server initialization"
yarn workspace nexus-initializer run start

echo "Start console"
yarn run start:console

exec "$@"
