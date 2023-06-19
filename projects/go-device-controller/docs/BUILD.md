# libvpx

- cgo 사용
- [pkg-config](https://www.freedesktop.org/wiki/Software/pkg-config/)가 env에 등록되어있어야함.

## mac

- brew install pkg-config
- brew install libvpx

## windows

- msys2 사용

  - pacman -S mingw-w64-i686-gcc
  - pacman -S mingw-w64-x86_64-gcc
  - !!. mingw환경에 golang설치시 build script에서 로컬 go와 충돌함. mingw환경에서는 go설치하지 않는게 좋음.

