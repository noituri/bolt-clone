FROM node:18

WORKDIR /app

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./frontend/

RUN mkdir -p /data

WORKDIR /app/frontend

EXPOSE 4173

CMD ["npm", "run", "dev", "--", "--host"]
