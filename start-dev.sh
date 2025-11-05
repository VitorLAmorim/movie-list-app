#!/bin/bash

echo "🎬 Iniciando Movie List App em modo desenvolvimento"
echo "=================================================="

# Verificar se .env.local existe e tem a chave TMDb
if [ ! -f ".env.local" ]; then
    echo "❌ Arquivo .env.local não encontrado. Copiando .env.example..."
    cp .env.example .env.local
fi

# Verificar se a chave TMDb foi configurada
if grep -q "sua_chave_tmdb_aqui" .env.local; then
    echo ""
    echo "⚠️  ATENÇÃO: Você precisa configurar sua chave TMDb!"
    echo ""
    echo "1. Acesse: https://www.themoviedb.org/settings/api"
    echo "2. Copie sua chave API"
    echo "3. Edite o arquivo .env.local e substitua 'sua_chave_tmdb_aqui'"
    echo ""
    echo "Pressione ENTER para continuar mesmo assim (apenas para testes)..."
    read
fi

echo ""
echo "📦 Verificando dependências..."

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências principais..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Instalando dependências do backend..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Instalando dependências do frontend..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "🚀 Iniciando aplicação..."
echo ""
echo "Acesse:"
echo "- Frontend: http://localhost:3000"
echo "- Backend:  http://localhost:3001"
echo ""
echo "Pressione Ctrl+C para parar"
echo ""

# Iniciar backend e frontend simultaneamente
npm run dev:all