#!/bin/bash

echo "🎬 Configurando Movie List App para desenvolvimento local"
echo "=================================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale npm"
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Instalar dependências do backend
echo ""
echo "📦 Instalando dependências do backend..."
cd backend
npm install

# Instalar dependências do frontend
echo ""
echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm install

# Voltar para o diretório raiz
cd ..

echo ""
echo "✅ Setup completo!"
echo ""
echo "🚀 Para iniciar a aplicação:"
echo "1. Configure sua chave TMDb no arquivo .env"
echo "2. Configure um banco de dados PostgreSQL local ou use online"
echo "3. Execute: npm run dev:all"
echo ""
echo "📝 Se não tiver PostgreSQL local, você pode:"
echo "- Usar um serviço online (Neon, Supabase, ElephantSQL)"
echo "- Ou instalar Docker corretamente para o WSL"