FROM node:18-alpine3.17 as builder
WORKDIR /usr/app
COPY package*.json .
RUN npm install
COPY . .
RUN apk update
RUN apk upgrade
RUN apk add bash
CMD ["npm","run","start:prod"]