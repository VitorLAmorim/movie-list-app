# Movie List Backend

Backend da aplicação de lista de filmes construído com Node.js, Express, TypeScript e PostgreSQL.

## Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados relacional
- **pg** - Driver PostgreSQL para Node.js

## Pré-requisitos

- Node.js 16+
- PostgreSQL 12+
- npm ou yarn

## Configuração

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

   Edite o arquivo `.env` com suas configurações:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/movie_list
   TMDB_API_KEY=your_tmdb_api_key
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

3. **Crie o banco de dados PostgreSQL:**
   ```sql
   CREATE DATABASE movie_list;
   ```

4. **Execute a aplicação:**

   Para desenvolvimento:
   ```bash
   npm run dev
   ```

   Para produção:
   ```bash
   npm run build
   npm start
   ```

## Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento com ts-node
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Executa a versão compilada
- `npm test` - Executa testes

## Estrutura do Banco de Dados

O backend criará automaticamente as seguintes tabelas PostgreSQL:

- `users` - Usuários da aplicação
- `favorites` - Filmes favoritos dos usuários
- `shared_lists` - Listas compartilhadas

## API Endpoints

### Movies
- `GET /api/movies/search?query={query}&page={page}` - Buscar filmes
- `GET /api/movies/{id}` - Detalhes do filme
- `GET /api/movies/popular/list?page={page}` - Filmes populares
- `GET /api/movies/trending/list?timeWindow={week|day}&page={page}` - Filmes em alta

### Favorites
- `POST /api/favorites/add/{movieId}` - Adicionar filme aos favoritos
- `DELETE /api/favorites/remove` - Remover filme dos favoritos
- `GET /api/favorites/list?username={username}` - Listar favoritos
- `GET /api/favorites/check?username={username}&movieId={movieId}` - Verificar se filme é favorito

### Shared Lists
- `POST /api/shared/create` - Criar link compartilhado
- `GET /api/shared/{shareToken}` - Acessar lista compartilhada
- `GET /api/shared/links/user?username={username}` - Links do usuário
- `PUT /api/shared/update` - Atualizar expiração do link
- `DELETE /api/shared/delete` - Remover link compartilhado

## Variáveis de Ambiente

- `DATABASE_URL` - String de conexão PostgreSQL (obrigatório)
- `TMDB_API_KEY` - Chave da API The Movie Database (obrigatório)
- `PORT` - Porta do servidor (padrão: 3001)
- `NODE_ENV` - Ambiente (development/production)
- `FRONTEND_URL` - URL do frontend para CORS (padrão: http://localhost:3000)

## Desenvolvimento

O backend está configurado com TypeScript compilado sob demanda usando `ts-node`. O nodemon reinicia automaticamente o servidor quando há mudanças nos arquivos.