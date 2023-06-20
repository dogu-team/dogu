FROM node:16.16.0-alpine AS node-base-docs
WORKDIR /dogu

FROM node-base-docs AS dogu-docs
COPY . .
RUN yarn release:prepare
EXPOSE 3100
CMD ["yarn", "run", "serve"]
