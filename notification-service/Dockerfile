FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 8084

CMD ["npx sequelize-cli db:migrate && npm run start:dev"]