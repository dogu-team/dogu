#!/bin/bash

# Function to log and exit with an error message
function exit_with_error() {
  echo "Error: $1"
  exit 1
}

# Start Xvfb in the background
Xvfb :9 -screen 0 1920x1080x24 &

# Get the PID of the Xvfb process
XVFB_PID=$!

# Start the yarn dogu-agent run in the background
yarn dogu-agent run --linux-device-serial $(uuidgen) "$@" &

# Get the PID of the yarn dogu-agent process
DOG_AGENT_PID=$!

# Wait for either of the processes to exit
wait -n

# Get the PID of the exited process
EXITED_PID=$!

# Determine which process exited and take appropriate action
if [ $EXITED_PID -eq $XVFB_PID ]; then
  echo "Xvfb has terminated. Terminating yarn dogu-agent."
  kill -TERM $DOG_AGENT_PID
  wait $DOG_AGENT_PID
  exit_with_error "yarn dogu-agent run has terminated."
elif [ $EXITED_PID -eq $DOG_AGENT_PID ]; then
  echo "yarn dogu-agent run has terminated. Terminating Xvfb."
  kill -TERM $XVFB_PID
  wait $XVFB_PID
  exit_with_error "Xvfb has terminated."
fi
