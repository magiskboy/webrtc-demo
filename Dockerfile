FROM node:alpine3.10

WORKDIR /app

ADD ./package.json .

RUN npm install

EXPOSE 3000

ADD . .

ENTRYPOINT ["node", "server.js"]
