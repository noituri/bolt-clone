FROM node:18

WORKDIR /app

COPY auth-login-service/package.json ./
RUN npm install

COPY db-schema/ ./db-schema/
COPY auth-login-service/ ./auth-login-service/

RUN mkdir -p /data

WORKDIR /app/auth-login-service

EXPOSE 3010

CMD ["node", "service.js"]