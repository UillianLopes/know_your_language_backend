FROM node:alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm uninstall bcrypt
RUN npm install
RUN npm install bcrypt

COPY . .

RUN npm run build

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]