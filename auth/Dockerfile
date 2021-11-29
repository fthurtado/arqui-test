FROM node:12.22.6

RUN mkdir /auth

WORKDIR /auth

COPY package.json yarn.lock ./
COPY src /.
RUN yarn install

EXPOSE 8080
