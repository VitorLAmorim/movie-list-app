# Movie List App

[![Deploy no Railway](https://img.shields.io/badge/Railway-Deploy%20Online-success?style=flat-square&logo=railway)](https://seu-link-do-railway.aqui)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Demonstração-red?style=flat-square&logo=youtube)](https://www.youtube.com/watch?v=seu-video-id)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

Uma aplicação completa de lista de filmes favoritos com integração à API The Movie Database (TMDb), desenvolvida com React, TypeScript e Tailwind CSS.

## 🎬 Sobre o Projeto

A Movie List App permite que usuários pesquisem filmes, adicionem-nos à sua lista pessoal de favoritos e compartilhem suas listas com outras pessoas através de links únicos. A aplicação consome dados da API TMDb para obter informações atualizadas sobre filmes, incluindo avaliações, posters, trailers e muito mais.

## 🚀 Funcionalidades

### Funcionalidades Principais
- 🔍 **Pesquisa de Filmes**: Busque filmes por título usando a API TMDb
- ⭐ **Filmes Populares e em Alta**: Explore listas de filmes populares e tendências
- ❤️ **Lista de Favoritos**: Adicione filmes à sua lista pessoal de favoritos
- 📊 **Avaliações TMDb**: Visualize as notas oficiais do TMDb para cada filme
- 🎯 **Detalhes Completos**: Acesse informações detalhadas包括 sinopse, elenco, direção, trailers
- 🔗 **Compartilhamento**: Compartilhe sua lista de favoritos através de links únicos
- 📱 **Interface Responsiva**: Design moderno que se adapta a todos os dispositivos

### Funcionalidades Técnicas
- 🐳 **Docker Compose**: Ambiente completo containerizado
- 🗄️ **PostgreSQL**: Banco de dados robusto para armazenamento
- 🔐 **Sistema de Usuários**: Autenticação simplificada por nome de usuário
- 🌐 **API REST**: Backend RESTful bem estruturado
- ⚡ **Performance**: Otimizado com rate limiting e caching
- 🎨 **UI/UX Moderna**: Interface intuitiva com styled-components

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18**: Biblioteca principal de UI
- **React Router**: Navegação entre páginas
- **Styled Components**: CSS-in-JS para estilização
- **Axios**: Cliente HTTP para requisições API
- **React Toastify**: Notificações toast
- **React Icons**: Biblioteca de ícones

### Backend
- **Node.js**: Ambiente de execução JavaScript
- **Express.js**: Framework web para API REST
- **PostgreSQL**: Sistema de banco de dados relacional
- **Axios**: Cliente HTTP para API TMDb
- **UUID**: Geração de tokens únicos
- **Helmet**: Middleware de segurança
- **Express Rate Limit**: Proteção contra abuso

### DevOps
- **Docker**: Containerização da aplicação
- **Docker Compose**: Orquestração dos serviços
- **PostgreSQL Container**: Banco de dados containerizado

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

## 🚀 Configuração e Instalação

Siga os passos abaixo para configurar e executar a aplicação:

### 1. Clonar o Repositório

```bash
git clone https://github.com/VitorLAmorim/movie-list-app
cd movie-list-app
```

### 2. Obter Chave da API TMDb

1. Acesse [TMDb](https://www.themoviedb.org/)
2. Crie uma conta gratuita
3. Vá para [Configurações > API](https://www.themoviedb.org/settings/api)
4. Solicite uma chave de API para desenvolvedor
5. Copie sua chave API (v3 auth)

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` e adicione sua chave API:
```env
# TMDB API Key
# Obtenha sua chave em https://www.themoviedb.org/settings/api
TMDB_API_KEY=sua_tmdb_api_key_aqui
```

### 4. Iniciar os Serviços com Docker Compose

```bash
docker-compose up -d
```

Este comando irá:
- Criar e iniciar o container PostgreSQL
- Construir e iniciar o backend Node.js
- Construir e iniciar o frontend React
- Executar o script de inicialização do banco de dados

### 5. Aguardar Inicialização

Aguarde alguns minutos para que todos os serviços sejam inicializados completamente. Você pode verificar o status com:

```bash
docker-compose logs -f
```

## 🌐 Acessando a Aplicação

Após a inicialização completa, acesse:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🎥 Demonstração e Deploy

### 🚀 Aplicação em Produção
**[🔴 Teste a aplicação ao vivo no Railway](https://movie-list-app-production.up.railway.app/)**

- URL: https://movie-list-app-production.up.railway.app/
- Ambiente: Produção (Railway)
- Status: ✅ Online e funcional

### 📹 Vídeo de Demonstração
**[🎬 Assista à demonstração completa no YouTube](https://youtu.be/MstIeiPDSck)**

- Duração: 02:15 minutos
- Conteúdo: Tour pela aplicação.
- Tecnologias demonstradas: React, TypeScript, Tailwind CSS, Node.js

### 🎯 O que você verá no vídeo:
- ✅ Funcionalidades principais da aplicação
- ✅ Sistema de autenticação e usuários
- ✅ Busca e gerenciamento de favoritos
- ✅ Sistema de compartilhamento de listas

## 📁 Estrutura do Projeto

```
movie-list-app/
├── backend/                    # API Node.js
│   ├── src/
│   │   ├── controllers/        # Controladores da API
│   │   ├── models/            # Modelos de dados
│   │   ├── routes/            # Rotas da API
│   │   ├── services/          # Serviços (TMDb, etc.)
│   │   ├── utils/             # Utilitários (banco, etc.)
│   │   └── server.js          # Servidor Express
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # Aplicação React
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/             # Páginas principais
│   │   ├── services/          # Serviços API
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── styles/            # Estilos e tema
│   │   ├── App.js             # Componente principal
│   │   └── index.js           # Ponto de entrada
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── database/                   # Scripts do banco de dados
│   └── init.sql              # Script de inicialização
├── docker-compose.yml          # Configuração Docker Compose
├── .env.example               # Exemplo de variáveis de ambiente
└── README.md                  # Documentação
```

## 🔧 Endpoints da API

### Filmes
- `GET /api/movies/search?query={term}&page={n}` - Buscar filmes
- `GET /api/movies/{id}` - Detalhes de um filme
- `GET /api/movies/popular/list?page={n}` - Filmes populares
- `GET /api/movies/trending/list?timeWindow={week/day}&page={n}` - Filmes em alta

### Favoritos
- `POST /api/favorites/add/{movieId}` - Adicionar filme aos favoritos
- `DELETE /api/favorites/remove` - Remover filme dos favoritos
- `GET /api/favorites/list?username={user}` - Lista de favoritos
- `GET /api/favorites/check?username={user}&movieId={id}` - Verificar se é favorito

### Compartilhamento
- `POST /api/shared/create` - Criar link de compartilhamento
- `GET /api/shared/{shareToken}` - Acessar lista compartilhada
- `GET /api/shared/links/user?username={user}` - Links do usuário
- `PUT /api/shared/update` - Atualizar expiração do link
- `DELETE /api/shared/delete` - Remover link de compartilhamento

## 🎮 Como Usar a Aplicação

### 1. Criar uma Conta
- Clique em "Entrar" no cabeçalho
- Digite um nome de usuário único
- Seus dados são salvos localmente

### 2. Pesquisar Filmes
- Use a barra de busca na página inicial
- Explore as abas "Em Alta" e "Populares"
- Clique nos cards para ver detalhes completos

### 3. Gerenciar Favoritos
- Clique em "Favoritar" para adicionar filmes à sua lista
- Acesse "Favoritos" no menu para ver sua lista
- Remova filmes clicando em "Remover"

### 4. Compartilhar Lista
- Na página de favoritos, clique em "Compartilhar Lista"
- Copie o link gerado
- Compartilhe o link com amigos

### 5. Ver Listas Compartilhadas
- Acesse um link compartilhado
- Veja a lista de favoritos de outro usuário
- Copie o link para compartilhar ainda mais

## 🔒 Segurança

### Medidas de Segurança Implementadas
- **Rate Limiting**: Limitação de requisições por IP
- **Helmet**: Headers de segurança HTTP
- **Input Validation**: Validação de dados de entrada
- **SQL Injection Protection**: Uso de parâmetros query
- **CORS Config**: Configuração segura de CORS

### Melhores Práticas
- Use senhas fortes para o banco de dados
- Mantenha sua chave TMDb privada
- Em produção, use HTTPS
- Configure timeouts apropriados
- Monitore logs de erro

## 🐛 Troubleshooting

### Problemas Comuns

**Portas já em uso:**
```bash
# Verificar processos usando as portas
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Ou altere as portas no docker-compose.yml
```

**Erro de conexão com PostgreSQL:**
```bash
# Verificar se o container está rodando
docker-compose ps

# Reiniciar os serviços
docker-compose down
docker-compose up -d
```

**Problemas com permissões:**
```bash
# No Linux/Mac, pode ser necessário ajustar permissões
sudo chown -R $USER:$USER .
```

**Chave API TMDb inválida:**
- Verifique se a chave foi copiada corretamente
- Confirme que sua chave TMDb está ativa
- Verifique se você atingiu os limites de taxa da API

### Logs e Debug

```bash
# Ver logs de todos os serviços
docker-compose logs

# Ver logs de um serviço específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Logs em tempo real
docker-compose logs -f
```

## 🚀 Implantação (Deployment)

### Para Produção

1. **Variáveis de Ambiente:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
TMDB_API_KEY=your_production_api_key
FRONTEND_URL=https://yourdomain.com
```

2. **Segurança Adicional:**
- Use variáveis de ambiente sensíveis
- Configure HTTPS
- Implemente backup do banco de dados
- Configure monitoramento

3. **Docker Compose Produção:**
```bash
# Usar docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- [The Movie Database (TMDb)](https://www.themoviedb.org/) - Pelos dados e API de filmes
- [React](https://reactjs.org/) - Pela biblioteca de UI fantástica
- [Express.js](https://expressjs.com/) - Pelo framework web robusto
- [PostgreSQL](https://www.postgresql.org/) - Pelo excelente banco de dados
- [Docker](https://www.docker.com/) - Pela plataforma de containerização

## 📞 Suporte

Se você encontrou algum problema ou tem alguma sugestão:

1. Verifique a seção de [Troubleshooting](#-troubleshooting)
2. Abra uma [Issue](https://github.com/your-repo/issues)
3. Entre em contato através de: vitorlamorimti@hotmail.com

---

**Divirta-se criando sua lista de filmes favoritos! 🎬✨**
