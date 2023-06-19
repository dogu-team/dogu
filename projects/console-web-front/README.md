# Dogu - console web front

## How to start

1. Development(local) environment

   - Requirements
     - Yarn
     - Yarn Berry(Yarn2)
       ```
       yarn set version berry
       yarn install
       yarn dlx @yarnpkg/sdks vscode
       ```
     - `yarn install`
   - `yarn dev`

2. `.env.loc` file

   - 로컬 실행 시 `.env.loc` 파일 생성

   ```
   DOGU_DOT_ENV=.env.local
   NEXT_PUBLIC_ENV=local
   NEXT_PUBLIC_DOGU_API_BASE_URL=http://localhost:3001
   NEXT_PUBLIC_DOGU_WS_BASE_URL=ws://localhost:3001
   ```
