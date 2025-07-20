FROM node:18

WORKDIR /app

COPY payment-service/package.json ./
RUN npm install

COPY ../db-schema/ ./db-schema/
COPY payment-service/ ./payment-service/

WORKDIR /app/payment-service

EXPOSE 3002

CMD ["node", "service.js"]
