@echo off
set "work_dir={{work_dir}}"
set "file_url={{file_url}}"
set "file_size={{file_size}}"
set "installer={{installer}}"

echo Start update Dogu-Agent
cd /d "%work_dir%"


echo Download app...
curl -o "%installer%" -L "%file_url%"

echo Waiting...
ping 127.0.0.1 -n 6 > nul


echo Running installer...
start "" "%installer%"
echo Installer started.


echo Deleting installer...
del "%installer%"
echo Installer deleted.


echo Task completed.
