## windows

- msys2 사용

  - 다운로드 링크 https://github.com/msys2/msys2-installer/releases/download/2023-07-18/msys2-x86_64-20230718.exe
    (링크 안되면 공홈 들어가서 인스톨러 다운로드 https://www.msys2.org/)

  - "C:\msys64\mingw64.exe" 로 mingw64 shell 실행

  - pacman -S mingw-w64-i686-gcc
  - pacman -S mingw-w64-x86_64-gcc
  - !!. mingw환경에 golang설치시 build script에서 로컬 go와 충돌함. mingw환경에서는 go설치하지 않는게 좋음.
