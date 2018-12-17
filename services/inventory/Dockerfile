FROM node:10.14.0-alpine

ENV APP_HOSTNAME=0.0.0.0
ENV APP_PORT=8080
ENV WITH_SASL=0

RUN apk --no-cache add \
      bash \
      g++ \
      ca-certificates \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev \
      make \
      python

RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py-setuptools bash

COPY ./services/inventory /services/inventory

COPY ./services/shared /services/shared

WORKDIR /services/inventory

RUN npm install

EXPOSE 8080

CMD ["node", "index.js"]
