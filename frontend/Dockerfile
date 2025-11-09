FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY . .

# Build do React com TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Instala serve para servir arquivos estáticos
RUN npm install -g serve

COPY --from=builder /app/build ./build

EXPOSE 3000

# Para Railway (produção) - serve os arquivos estáticos
CMD ["serve", "-s", "build", "-l", "3000"]