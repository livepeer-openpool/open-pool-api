FROM node:20.11.0 as builder

WORKDIR /app
COPY . .

ENV NODE_ENV production

RUN npm ci

EXPOSE 3000

CMD [ "node", "index.js" ]