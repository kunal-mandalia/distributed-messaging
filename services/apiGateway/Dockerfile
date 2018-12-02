FROM node:10.14.0-alpine
ENV APP_HOSTNAME=0.0.0.0
ENV APP_PORT=8080
ENV SERVICE_ADDRESS_ORDER=http://localhost:6001
COPY . /service
WORKDIR /service
EXPOSE 8080
CMD ["node", "index.js"]