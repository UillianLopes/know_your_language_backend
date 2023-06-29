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

COPY . .

COPY --from=build /usr/src/app/dist ./dist

CMD ["node", "dist/src/main"]
