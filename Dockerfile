FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 3000

RUN yarn build
# RUN node .output/server/index.mjs
# RUN yarn start
