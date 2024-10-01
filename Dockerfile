FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./

COPY . .

RUN npm install

ENV PORT=8080
ENV NODE_ENV=production

CMD ["npm", "start"]