#!/bin/bash
echo "Start rdb migration"
yarn workspace dogu-client-admin-server run typeorm:init
if [ $? -eq 0 ]; then
  echo "DB migration success"
else
  echo "DB migration failed"
  exit 1
fi

echo "Start Server"
yarn workspace dogu-client-admin-server start
if [ $? -eq 0 ]; then
  echo "Console start success"
else
  echo "Console start failed"
  exit 1
fi

exec "$@"
