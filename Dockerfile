FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run prisma:generate

RUN npm run build

CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"development\" ]; then npm run start:migrate:dev; else npm run start:migrate:prod; fi"]
# CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"development\" ]; then npm run start:dev; else npm run start:prod; fi"]
