# 🎬 Movie List App - Configuração Sem Docker

Guia alternativo para rodar a aplicação sem Docker, ideal para desenvolvimento local ou quando Docker não está disponível.

## 🚀 Configuração Rápida

### Pré-requisitos
- Node.js 18+
- npm
- PostgreSQL para melhor experiência

### 1. Instalação das Dependências

```bash
# Instalar dependências do projeto raiz
npm install

# Instalar dependências de backend e frontend
npm run install:all
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de ambiente da pasta backend:
```bash
cp .env.example .env
```

Edite o `.env.local`:
```env
# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# API Configuration
TMDB_API_KEY=your_tmdb_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Iniciar a Aplicação

```bash
# Iniciar backend e frontend simultaneamente
npm run dev:all
```

Ou separadamente:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### 4. Acessar a Aplicação

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🗄️ Banco de Dados PostgreSQL

### Opção 1: PostgreSQL Local (Recomendado para Desenvolvimento)
```bash
# No Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb movie_list
sudo -u postgres createuser movie_user
sudo -u postgres psql -c "ALTER USER movie_user PASSWORD 'movie_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE movie_list TO movie_user;"
```

### Opção 2: PostgreSQL Online (Gratuito)
- [Neon](https://neon.tech/) - PostgreSQL serverless gratuito
- [Supabase](https://supabase.com/) - Firebase alternative com PostgreSQL
- [ElephantSQL](https://www.elephantsql.com/) - PostgreSQL como serviço

## 🔧 Como Obter Chave TMDb

1. Acesse [themoviedb.org](https://www.themoviedb.org/)
2. Crie uma conta gratuita
3. Vá para [Settings > API](https://www.themoviedb.org/settings/api)
4. Clique em "Request an API Key"
5. Escolha "Developer"
6. Copie a chave (v3 auth)
7. Cole no `.env.local`

## 🐛 Solução de Problemas

### Erro: "Cannot find module"
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Erro: "Port already in use"
```bash
# Verificar processos
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Matar processos se necessário
kill -9 <PID>
```

### Erro: "TMDB API key invalid"
- Verifique se a chave foi copiada corretamente
- Confirme que não há espaços em branco
- Verifique se a chave está ativa no painel TMDb

### Erro de permissão no Linux
```bash
chmod +x scripts/setup-local.sh
```

## 📱 Uso da Aplicação

1. **Criar Usuário**: Clique em "Entrar" e digite um nome de usuário
2. **Pesquisar Filmes**: Use a barra de busca
3. **Adicionar Favoritos**: Clique no botão "Favoritar"
4. **Ver Favoritos**: Acesse a aba "Favoritos"
5. **Compartilhar**: Clique em "Compartilhar Lista" para gerar um link

## 🎯 Funcionalidades Principais

- ✅ Busca de filmes em tempo real
- � Lista de favoritos pessoal
- ✅ Avaliações e detalhes completos
- ✅ Compartilhamento via link
- ✅ Interface responsiva
- ✅ Sistema de usuários simples

## 🚀 Para Produção

Em produção, é recomendado:
- Usar PostgreSQL (não SQLite)
- Configurar variáveis de ambiente seguras
- Usar HTTPS
- Configurar rate limiting
- Implementar backups automáticos

---

**Dúvidas? Verifique o [README principal](README.md) ou abra uma issue!**