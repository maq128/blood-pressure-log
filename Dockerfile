FROM node:lts-alpine

VOLUME /app
WORKDIR /app

COPY ./backend /app/backend
COPY ./public /app/public
COPY ./src /app/src
COPY ./index.html /app/index.html
COPY ./package.json /app/package.json
COPY ./vite.config.js /app/vite.config.js

RUN cd /app && npm install && npm run build

EXPOSE 5173

CMD ["npm", "run", "dev"]
