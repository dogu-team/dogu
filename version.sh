#!/bin/bash

# Function to display script usage
usage() {
  echo "Usage: ./version.sh --version <version> [--dogu] [--dost]"
  exit 1
}

# Initialize variables
version=""
dogu=false
dost=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --version)
      version="$2"
      shift
      shift
      ;;
    --dogu)
      dogu=true
      shift
      ;;
    --dost)
      dost=true
      shift
      ;;
    *)
      usage
      ;;
  esac
done

# Check if version is provided
if [[ -z $version ]]; then
  usage
fi

# # Update version and iterate subdirectories
# yarn version -i "$version"
# find ./projects -mindepth 1 -maxdepth 1 -type d -exec sh -c "cd {} && yarn version -i $version" \;

# Execute additional commands based on options
if [[ $dogu == true ]]; then
  echo "Performing additional operations for dogu"
  yarn version -i "$version"
  find ./projects -mindepth 1 -maxdepth 1 -type d -exec sh -c "cd {} && yarn version -i $version" \;
  exit 0
fi

if [[ $dost == true ]]; then
  echo "Performing additional operations for dost"
  cd nm-space
  yarn workspace dost version -i "$version"
  exit 0
fi

# Execute additional commands if any option is specified
if [[ $dogu == false && $dost == false ]]; then
  echo "Performing additional operations for dogu and dost"
  yarn version -i "$version"
  find ./projects -mindepth 1 -maxdepth 1 -type d -exec sh -c "cd {} && yarn version -i $version" \;
  cd nm-space
  yarn workspace dost version -i "$version"
  exit 0
fi
