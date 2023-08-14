# initial settings

## install as npm

- yarn install

## 프로젝트 생성 명령어

- npm uninstall -g react-native-cli
- yarn global remove react-native-cli
- npx react-native init --npm --template react-native-template-typescript@6.10.* deviceagent

## Android app_process 앱 개발방법

- android-device-agent/android_proc 폴더를 Android Studio로 연다.
- app 모듈 빌드
- android/app/build.gradle에 runDebugBuild() task 실행.

## settings

download android studio
install android sdk

- build-tools 31.0.0
  cmdline-tools latest
  platform-tools latest

- install jdk 11 with JAVA_HOME
