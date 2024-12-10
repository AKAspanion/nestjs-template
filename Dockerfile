FROM node:20

WORKDIR /app

COPY package*.json ./
COPY yarn*.lock ./

RUN yarn install

COPY . .

RUN yarn prisma:generate

RUN yarn build

CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"development\" ]; then yarn start:migrate:dev; else yarn start:migrate:prod; fi"]
# CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"development\" ]; then yarn start:dev; else yarn start:prod; fi"]
