# 🚀 Quick Start - Movie List App

Guia rápido para iniciar a aplicação sem Docker.

## ⚡ Início Rápido

### 1. Configurar Chave TMDb
```bash
# Edite o arquivo .env.local
nano .env.local

# Substitua 'sua_chave_tmdb_aqui' pela sua chave real
TMDB_API_KEY=sua_chave_real_aqui
```

### 2. Executar Script de Inicialização
```bash
./start-dev.sh
```

### 3. Acessar Aplicação
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🔧 Passo a Passo Manual

Se preferir fazer manualmente:

```bash
# 1. Instalar dependências
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Configurar ambiente
cp .env.example .env.local
# Edite .env.local com sua chave TMDb

# 3. Iniciar backend (Terminal 1)
cd backend && npm run dev

# 4. Iniciar frontend (Terminal 2)
cd frontend && npm start
```

## 🎯 Usando a Aplicação

1. **Entrar**: Clique em "Entrar" e digite qualquer nome de usuário
2. **Pesquisar**: Use a barra de busca para encontrar filmes
3. **Favoritar**: Clique em "Favoritar" para adicionar à sua lista
4. **Ver Favoritos**: Acesse a aba "Favoritos"
5. **Compartilhar**: Na página de favoritos, clique "Compartilhar Lista"

## 📝 Notas Importantes

- ✅ **Chave TMDb** obrigatória para funcionar
- ✅ **Dados** são salvos localmente em `movie_list.db`
- ✅ **Navegador**: Recomendado Chrome/Firefox

## 🆘 Problemas Comuns

**"TMDB API key invalid"**
- Verifique se a chave está correta no .env.local
- Confirme que não há espaços em branco

**"Port already in use"**
- Mude as portas no .env.local
- Ou feche outros programas usando as portas 3000/3001

**"Cannot find module"**
- Execute `npm run install:all` para reinstalar dependências

---
**Pronto! Divirta-se com sua lista de filmes! 🎬✨**