# Testes do Backend

Esta pasta contém todos os testes automatizados para o backend da aplicação Movie List App.

## 📁 Estrutura dos Testes

```
tests/
├── README.md                    # Documentação dos testes
├── setup.ts                     # Configuração global dos testes
├── testUtils.ts                 # Utilidades e mocks para testes
├── app.test.ts                  # Testes da aplicação principal
├── auth.test.ts                 # Testes das rotas de autenticação
├── movies.test.ts               # Testes das rotas de filmes
├── favorites.test.ts             # Testes das rotas de favoritos
├── shared.test.ts               # Testes das rotas de compartilhamento
└── integration.test.ts           # Testes de integração
```

## 🚀 Como Executar os Testes

### Instalar Dependências
```bash
npm install
```

### Executar Todos os Testes
```bash
npm test
```

### Executar em Modo Watch (desenvolvimento)
```bash
npm run test:watch
```

### Gerar Relatório de Cobertura
```bash
npm run test:coverage
```

### Executar Testes no CI/CD
```bash
npm run test:ci
```

### Depurar Testes
```bash
npm run test:debug
```

## 📊 Tipos de Teste Implementados

### ✅ Testes Unitários
- Validação de parâmetros de entrada
- Lógica de negócio dos controladores
- Tratamento de erros
- Validação de formatos de dados

### ✅ Testes de Integração
- Fluxos completos de usuário
- Integração entre diferentes rotas
- Comportamento com APIs externas
- Testes de performance básicos

### ✅ Testes de API
- Todos os endpoints REST
- Códigos de status HTTP
- Formatos de resposta
- Headers de segurança

## 🎯 Áreas Testadas

### 🔐 Autenticação (`auth.test.ts`)
- Registro de novos usuários
- Login com e sem senha
- Definição de senhas
- Validação de credenciais

### 🎬 Filmes (`movies.test.ts`)
- Busca de filmes por título
- Detalhes de filmes específicos
- Listas de filmes populares
- Filmes em alta (trending)
- Paginação de resultados

### ❤️ Favoritos (`favorites.test.ts`)
- Adição de filmes aos favoritos
- Remoção de filmes dos favoritos
- Listagem de favoritos por usuário
- Verificação de status de favorito

### 🔗 Compartilhamento (`shared.test.ts`)
- Criação de links de compartilhamento
- Acesso a listas compartilhadas
- Gestão de links (atualização, remoção)
- Validação de tokens
- Expiração de links

### 🔍 Integração (`integration.test.ts`)
- Fluxos completos de usuário
- Comportamento sob carga
- Tratamento de erros
- Performance e rate limiting
- Segurança e CORS

## 🛠️ Mocks e Utilitários

### Mocks Principais
- **Banco de Dados**: `jest.mock('../utils/database')`
- **API TMDB**: `jest.mock('../services/tmdbService')`
- **UUID**: `jest.mock('uuid')`

### Dados de Teste
- **Filme Mock**: Estrutura completa de dados de filme
- **Usuário Mock**: Dados de usuário para testes
- **Favorito Mock**: Estrutura de favorito mockado
- **SharedList Mock**: Dados de lista compartilhada mockada

## 📈 Cobertura de Código

Os testes cobrem:
- ✅ Todas as rotas da API
- ✅ Validação de entrada
- ✅ Tratamento de erros
- ✅ Casos de borda
- ✅ Integração entre componentes

### Relatórios Gerados
- **Cobertura de Linhas**: Porcentagem do código testado
- **Cobertura de Funções**: Funções e métodos testados
- **Cobertura de Branches**: Desvios condicionais testados
- **Cobertura de Statements**: Linhas de código executadas

## 🐛 Ambiente de Teste

### Variáveis de Ambiente
- `NODE_ENV=test`: Ambiente de teste
- `TMDB_API_KEY`: Chave API mockada
- `FRONTEND_URL`: URL do frontend mockada

### Configuração Jest
- **Preset**: `ts-jest` para TypeScript
- **Test Environment**: Node.js
- **Timeout**: 10 segundos por padrão
- **Setup Arquivo**: `setup.ts`

## 🚨 Boas Práticas

### ✅ Implementado
- Testes isolados e independentes
- Mocks consistentes e reutilizáveis
- Nomenclatura clara e descritiva
- Cobertura de casos de sucesso e erro
- Testes de integração relevantes

### 🎯 Recomendações
- Manterner testes atualizados com as mudanças
- Adicionar testes para novas funcionalidades
- Revisar mocks quando as APIs externas mudarem
- Monitorar cobertura de código
- Testar performance em cargas elevadas

## 🔧 Como Adicionar Novos Testes

### 1. Criar Arquivo de Teste
```bash
# Exemplo: novo.test.ts
touch src/tests/novo.test.ts
```

### 2. Estrutura Básica
```typescript
import request from 'supertest';
import app from '../server';

describe('Nova Funcionalidade', () => {
  it('deve testar algo específico', async () => {
    const response = await request(app)
      .get('/api/novo-endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('propriedade');
  });
});
```

### 3. Executar Testes
```bash
npm test -- novo.test.ts
```

## 📝 Relatórios

Após executar `npm run test:coverage`, os relatórios são gerados em:
- `coverage/lcov-report/index.html` - Visualização interativa
- `coverage/lcov.info` - Formato LCOV para CI/CD
- Console - Resumo da cobertura

## 🐛 Troubleshooting

### Problemas Comuns

**Testes falham com "Cannot find module"**
- Verifique se os mocks estão configurados corretamente
- Confirme se os arquivos de importação existem

**Timeout nos testes**
- Aumente o timeout no jest.config.js
- Verifique se os mocks estão retornando promessas resolvidas

**Testes de integração muito lentos**
- Use `test.concurrent: true` no describe
- Otimize os mocks para evitar chamadas reais

**Cobertura baixa**
- Adicione testes para os caminhos não cobertos
- Revise se os mocks estão muito amplos

---

## 📞 Para Mais Informações

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergy/react-testing-cheat-sheet)