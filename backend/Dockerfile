FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

# Usa variável de ambiente para decidir qual comando rodar
# Railway usa NODE_ENV=production, docker-compose usa NODE_ENV=development
CMD ["sh", "-c", "npm run ${NODE_ENV:-development}"]