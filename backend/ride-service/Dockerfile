FROM node:18

WORKDIR /app

COPY ride-service/package.json ./
RUN npm install

COPY db-schema/ ./db-schema/
COPY ride-service/ ./ride-service/

WORKDIR /app/ride-service

EXPOSE 3001

CMD ["node", "service.js"]
