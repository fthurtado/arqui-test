FROM node:12.22.6

RUN mkdir /backend

WORKDIR /backend

COPY package.json yarn.lock ./
COPY src ./
RUN yarn install

EXPOSE 3000