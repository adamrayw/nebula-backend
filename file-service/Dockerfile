FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 8082

CMD ["npm", "run", "dev"]