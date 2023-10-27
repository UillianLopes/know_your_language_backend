FROM node:20-buster AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && apt-get install -y \
    python \
    make \
    g++

RUN npm install

COPY . .

RUN echo $NODE_ENV

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
