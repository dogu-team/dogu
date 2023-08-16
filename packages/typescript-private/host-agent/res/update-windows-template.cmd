@echo off
set "installer={{installer}}"

echo Waiting for 10 seconds...
ping 127.0.0.1 -n 11 > nul

echo Running installer...
start "" "%installer%"
echo Installer started.

echo Deleting installer...
del "%installer%"
echo Installer deleted.

echo Task completed.