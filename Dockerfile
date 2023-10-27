FROM node:20-buster AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && apt-get install -y \
    python \
    make \
    g++

RUN npm install

COPY . .

RUN npm run build

FROM node:20-buster as deployment

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && apt-get install -y \
    python \
    make \
    g++

RUN npm install --omit=dev
RUN npm run db:mig:gen
RUN npm run db:seed

COPY . .

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000
ENV NODE_ENV=prod
CMD ["npm", "run", "start:prod"]
