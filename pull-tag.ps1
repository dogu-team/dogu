git fetch --all
git tag | ForEach-Object { git tag -d $_ }
git fetch --tags
