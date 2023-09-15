ARG DEBIAN_FRONTEND=noninteractive

FROM ubuntu:22.04 AS dogu-console
RUN apt-get update \
    && apt-get install -y ca-certificates curl gnupg \
    && curl -sL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn \
    && apt update && apt install -y \
    openjdk-17-jre \
    aapt

RUN install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
    && chmod a+r /etc/apt/keyrings/docker.gpg
RUN echo \
    "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

WORKDIR /dogu
ENV NODE_OPTIONS --max-old-space-size=8192
COPY .dogu-workspace ./.dogu-workspace
COPY .yarnrc.yml package.json tsconfig.json tsconfig.eslint.json .pnp.cjs .pnp.loader.mjs yarn.lock ./
COPY .yarn ./.yarn
COPY .husky ./.husky
COPY packages/typescript ./packages/typescript
COPY packages/typescript-private ./packages/typescript-private
COPY packages/typescript-dev-private ./packages/typescript-dev-private
COPY projects/console-web-server ./projects/console-web-server
COPY projects/console-web-front ./projects/console-web-front
COPY projects/nexus-initializer ./projects/nexus-initializer

RUN mkdir -p ./projects/console-web-server/src/sdk/binary/linux
RUN mkdir -p ./projects/console-web-server/build/src/sdk/binary/linux
RUN cp /usr/bin/aapt2 ./projects/console-web-server/src/sdk/binary/linux/aapt2
RUN cp /usr/bin/aapt2 ./projects/console-web-server/build/src/sdk/binary/linux/aapt2

RUN yarn run newbie:cicd
RUN yarn run build

COPY ./shells/entrypoint.sh ./entrypoint.sh

EXPOSE 3001 4000 

ENTRYPOINT ["sh" ,"-c", "./entrypoint.sh"]


FROM ubuntu:22.04 AS dogu-agent

RUN apt-get update && \
    apt-get install -y \
    git \
    curl

RUN curl -o node-v16.20.2-linux-x64.tar.gz https://nodejs.org/download/release/v16.20.2/node-v16.20.2-linux-x64.tar.gz && \
    tar -xvf node-v16.20.2-linux-x64.tar.gz && \
    mv node-v16.20.2-linux-x64 /node && \
    rm node-v16.20.2-linux-x64.tar.gz

ENV PATH /node/bin:${PATH}
RUN corepack enable

WORKDIR /dogu
ENV NODE_OPTIONS --max-old-space-size=8192 ${NODE_OPTIONS}
COPY .dogu-workspace ./.dogu-workspace
COPY .yarnrc.yml package.json tsconfig.json tsconfig.eslint.json .pnp.cjs .pnp.loader.mjs yarn.lock ./
COPY .yarn ./.yarn
COPY .husky ./.husky
COPY packages/typescript ./packages/typescript
COPY packages/typescript-private ./packages/typescript-private
COPY packages/typescript-dev-private ./packages/typescript-dev-private
COPY projects/dogu-agent ./projects/dogu-agent

RUN yarn run newbie:cicd
RUN yarn run build
RUN yarn run third-party:download:build

ENTRYPOINT ["yarn", "dogu-agent"]
