FROM node:18-alpine

WORKDIR /app

# Instala dependências de build do TypeScript
RUN npm install -g typescript

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY . .

# Build do TypeScript
RUN npm run build

EXPOSE 3001

# Para Railway (produção)
CMD ["npm", "start"]