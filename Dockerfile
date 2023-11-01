FROM node:20-buster AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && apt-get install -y \
    python \
    make \
    g++

RUN npm install

COPY . .

ARG NODE_ENV
ARG DB_HOST
ARG DB_PORT
ARG DB_USERNAME
ARG DB_PASSWORD
ARG DB_NAME

ENV NODE_ENV=${NODE_ENV}
ENV DB_HOST=${DB_HOST}
ENV DB_PORT=${DB_PORT}
ENV DB_USERNAME=${DB_USERNAME}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV DB_NAME=${DB_NAME}

RUN npm run build
RUN npm run db:mig:run
RUN npm run db:seed

FROM node:20-buster as deployment

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && apt-get install -y \
    python \
    make \
    g++

RUN npm install --omit=dev

COPY . .

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000
ENV NODE_ENV=prod
CMD ["npm", "run", "start:prod"]
