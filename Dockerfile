FROM node:16.13.1-alpine

WORKDIR /usr/src/app

COPY ./package.json ./
RUN npm install

COPY ./bin/www ./bin/
COPY ./app.js .
COPY ./routes ./routes/

EXPOSE 3000

ENTRYPOINT ["./bin/www"]
