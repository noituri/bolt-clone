FROM node:18

WORKDIR /app

COPY user-admin-service/package.json ./
RUN npm install

COPY ../db-schema/ ./db-schema/
COPY user-admin-service/ ./user-admin-service/

WORKDIR /app/user-admin-service

EXPOSE 3003

CMD ["node", "service.js"]
