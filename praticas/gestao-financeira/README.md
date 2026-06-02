# Tutorial — App Gestão Financeira (React Native + API REST + MySQL)

Este tutorial documenta a evolução completa do app `gestao-financeira` — desde o zero até
um sistema com autenticação JWT, banco de dados MySQL, gráficos e filtros.

> **Pré-requisitos:** Node.js LTS, MySQL Server (usuário `root`, senha `Senha10adaps`),
> MySQL Workbench (ou DBeaver) e Postman/Insomnia para testar os endpoints.

---

## Sumário

1. [Visão geral da arquitetura](#1-visão-geral-da-arquitetura)
2. [Criar o projeto da API](#2-criar-o-projeto-da-api)
3. [Configurar o Prisma com MySQL](#3-configurar-o-prisma-com-mysql)
4. [Modelar `Category`, `Transaction` e `User`](#4-modelar-category-transaction-e-user)
5. [Rodar as migrations](#5-rodar-as-migrations)
6. [Popular dados iniciais (seed)](#6-popular-dados-iniciais-seed)
7. [Estrutura de pastas e código do servidor](#7-estrutura-de-pastas-e-código-do-servidor)
8. [Autenticação JWT](#8-autenticação-jwt)
9. [Subir o servidor e ver no Prisma Studio](#9-subir-o-servidor-e-ver-no-prisma-studio)
10. [Conectar o app à API](#10-conectar-o-app-à-api)
11. [Tela de Login](#11-tela-de-login)
12. [Melhorias no frontend](#12-melhorias-no-frontend)
13. [Testar os endpoints no Postman](#13-testar-os-endpoints-no-postman)
14. [Comandos resumidos](#14-comandos-resumidos)
15. [Rodar o app conectado à API (end-to-end)](#15-rodar-o-app-conectado-à-api-end-to-end)
16. [Status das implementações](#16-status-das-implementações)

---

## 1. Visão geral da arquitetura

```
[ App React Native ]  --HTTP + JWT-->  [ API Express ]  --Prisma-->  [ MySQL ]
   gestao-financeira/                   gestao-financeira-api/         localhost:3306
```

- O app autentica via `POST /auth/login` e recebe um token JWT.
- Todas as rotas de dados (`/categories`, `/transactions`) exigem o token no header
  `Authorization: Bearer <token>`.
- O **Prisma** é o ORM: traduz JavaScript em SQL automaticamente.

---

## 2. Criar o projeto da API

```
praticas/
├─ gestao-financeira/        <-- app (já existe)
└─ gestao-financeira-api/    <-- API REST
```

Dentro de `praticas/gestao-financeira-api/`:

```bash
npm init -y
npm install express cors zod dotenv @prisma/client bcryptjs jsonwebtoken
npm install --save-dev prisma nodemon
```

`package.json` — seção `scripts` e `"type": "module"`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "prisma:studio": "prisma studio",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "node prisma/seed.js"
  }
}
```

---

## 3. Configurar o Prisma com MySQL

Crie o banco no MySQL Workbench:

```sql
CREATE DATABASE gestao_financeira CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Instale versões fixas do Prisma e inicialize:

```bash
npm install prisma@5.22.0 @prisma/client@5.22.0
npx prisma init --datasource-provider mysql
```

Edite `.env`:

```env
DATABASE_URL="mysql://root:Senha10adaps@localhost:3306/gestao_financeira"
PORT=3000
JWT_SECRET=troque_por_uma_chave_secreta_forte_em_producao
```

`.env.example` (versionar sem segredos):

```env
DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/gestao_financeira"
PORT=3000
JWT_SECRET=troque_por_uma_chave_secreta_forte_em_producao
```

`.gitignore`:

```
node_modules
.env
```

---

## 4. Modelar `Category`, `Transaction` e `User`

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Category {
  id           String        @id @default(cuid())
  name         String        @unique
  displayName  String
  icon         String
  background   String
  isIncome     Boolean       @default(false)
  isDefault    Boolean       @default(false)
  createdAt    DateTime      @default(now())
  transactions Transaction[]
}

model Transaction {
  id          String   @id @default(cuid())
  description String
  value       Decimal  @db.Decimal(12, 2)
  date        DateTime
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}
```

**Pontos importantes:**
- `cuid()` gera IDs únicos — substitui o frágil `length + 1`.
- `Decimal(12,2)` é o tipo correto para dinheiro.
- `isIncome` no banco substitui comparações de string no front.
- `isDefault` protege categorias semente de exclusão.
- `User.password` armazena apenas o hash bcrypt — nunca texto puro.

---

## 5. Rodar as migrations

```bash
npx prisma migrate dev --name init
```

Para adicionar o model `User` (se o banco já existia):

```bash
npx prisma migrate dev --name add-user
```

Após cada migration, o Prisma gera o **Prisma Client** automaticamente.

---

## 6. Popular dados iniciais (seed)

`prisma/seed.js` cria as 5 categorias padrão e um usuário de acesso:

```js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultCategories = [
  { name: "income",    displayName: "Renda",       icon: "work",                background: "#DE9AC3", isIncome: true,  isDefault: true },
  { name: "food",      displayName: "Alimentação", icon: "fastfood",            background: "#DEA17B", isIncome: false, isDefault: true },
  { name: "house",     displayName: "Casa",        icon: "home",                background: "#E6E088", isIncome: false, isDefault: true },
  { name: "education", displayName: "Educação",    icon: "book",                background: "#AB8FBE", isIncome: false, isDefault: true },
  { name: "travel",    displayName: "Viagens",     icon: "airplanemode-active", background: "#82C9DE", isIncome: false, isDefault: true },
];

async function main() {
  for (const c of defaultCategories) {
    await prisma.category.upsert({ where: { name: c.name }, update: {}, create: c });
  }

  const hash = await bcrypt.hash("123456", 10);
  await prisma.user.upsert({
    where:  { email: "admin@gestao.com" },
    update: {},
    create: { name: "Amanda", email: "admin@gestao.com", password: hash },
  });

  console.log("Seed concluído. Usuário padrão: admin@gestao.com / 123456");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

```bash
npm run prisma:seed
```

> **Credenciais padrão:** `admin@gestao.com` / `123456`

---

## 7. Estrutura de pastas e código do servidor

```
gestao-financeira-api/
├─ prisma/
│  ├─ schema.prisma
│  ├─ seed.js
│  └─ migrations/
├─ src/
│  ├─ server.js
│  ├─ lib/
│  │  └─ prisma.js
│  ├─ middlewares/
│  │  ├─ auth.js          ← verifica JWT
│  │  └─ errorHandler.js
│  ├─ routes/
│  │  ├─ auth.js          ← POST /auth/login
│  │  ├─ categories.js
│  │  └─ transactions.js
│  └─ schemas/
│     ├─ authSchema.js
│     ├─ categorySchema.js
│     └─ transactionSchema.js
├─ postman/
│  └─ collection.json     ← importe no Postman
├─ .env
├─ .env.example
├─ .gitignore
└─ package.json
```

### `src/server.js`

```js
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import categoriesRouter from "./routes/categories.js";
import transactionsRouter from "./routes/transactions.js";
import { authenticate } from "./middlewares/auth.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, name: "gestao-financeira-api" }));

app.use("/auth",         authRouter);
app.use("/categories",   authenticate, categoriesRouter);
app.use("/transactions", authenticate, transactionsRouter);

app.use(errorHandler);

const port = process.env.PORT ?? 3000;
app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
```

---

## 8. Autenticação JWT

### 8.1 — Middleware (`src/middlewares/auth.js`)

Verifica o token em todas as rotas protegidas:

```js
import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
```

### 8.2 — Rota de login (`src/routes/auth.js`)

```js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { loginSchema } from "../schemas/authSchema.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});

export default router;
```

### 8.3 — Schema de validação (`src/schemas/authSchema.js`)

```js
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

---

## 9. Subir o servidor e ver no Prisma Studio

```bash
# Terminal 1 — servidor com hot-reload
npm run dev

# Terminal 2 — interface visual do banco (http://localhost:5555)
npm run prisma:studio
```

Acesse `http://localhost:3000/` e confirme: `{ "ok": true, "name": "gestao-financeira-api" }`.

---

## 10. Conectar o app à API

### 10.1 — `services/api.js`

Centraliza a comunicação e injeta o token JWT em cada requisição:

```js
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

let _token = null;

export function setAuthToken(token) {
  _token = token;
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
    },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.status === 204 ? null : response.json();
}

export const api = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  listCategories:    ()      => request("/categories"),
  createCategory:    (data)  => request("/categories",        { method: "POST",   body: JSON.stringify(data) }),
  updateCategory:    (id, d) => request(`/categories/${id}`,  { method: "PUT",    body: JSON.stringify(d) }),
  deleteCategory:    (id)    => request(`/categories/${id}`,  { method: "DELETE" }),
  listTransactions:  ()      => request("/transactions"),
  createTransaction: (data)  => request("/transactions",       { method: "POST",   body: JSON.stringify(data) }),
  updateTransaction: (id, d) => request(`/transactions/${id}`, { method: "PUT",    body: JSON.stringify(d) }),
  deleteTransaction: (id)    => request(`/transactions/${id}`, { method: "DELETE" }),
};
```

### 10.2 — `contexts/AuthContext.jsx`

Gerencia sessão do usuário com persistência via `AsyncStorage`:

```jsx
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setAuthToken } from "@/services/api";

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      try {
        const [[, token], [, userJson]] = await AsyncStorage.multiGet(["token", "user"]);
        if (token && userJson) { setAuthToken(token); setUser(JSON.parse(userJson)); }
      } finally { setLoading(false); }
    }
    restore();
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user } = await api.login(email, password);
    setAuthToken(token);
    await AsyncStorage.multiSet([["token", token], ["user", JSON.stringify(user)]]);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    setAuthToken(null);
    await AsyncStorage.multiRemove(["token", "user"]);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 10.3 — `contexts/GlobalState.jsx`

O Provider expõe agora também `updateTransaction`:

```jsx
const { transactions, categories, loading, error, refresh,
        addTransaction, updateTransaction, removeTransaction,
        addCategory, removeCategory } = useContext(MoneyContext);
```

### 10.4 — `.env` do app

```env
# Emulador Android (default)
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000

# Device físico (descubra o IP com `ipconfig`)
# EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
```

---

## 11. Tela de Login

`app/login.jsx` — formulário com e-mail e senha que chama `useAuth().login()`.

- O `app/_layout.jsx` usa `useEffect` para redirecionar automaticamente:
  - sem sessão → `/login`
  - com sessão → `/` (tabs)
- O `GlobalState` vive agora em `app/(tabs)/_layout.jsx` e só carrega dados
  quando o usuário já está autenticado.
- O header das tabs tem um botão de **logout** (ícone `logout` do Material Icons).

---

## 12. Melhorias no frontend

### 12.1 — Filtro de mês/ano

Presente nas telas **Transações** e **Resumo**. Exibe `< Maio 2026 >` com setas
para navegar entre meses. As transações exibidas são filtradas pelo mês/ano
selecionado.

### 12.2 — Mensagem de boas-vindas

A tela **Transações** exibe `Olá, [Nome]!` no topo, usando o nome do usuário
autenticado que vem do JWT decodificado.

### 12.3 — Edição de transação (toque longo + modal)

- **Toque longo** em qualquer transação abre um `Alert` com as opções **Editar**
  e **Excluir**.
- **Editar** abre um `Modal` deslizante com o formulário pré-preenchido
  (descrição, valor, data e categoria).
- Ao salvar, chama `updateTransaction(id, data)` do contexto, que faz
  `PUT /transactions/:id` e atualiza a lista localmente.

### 12.4 — Gráfico de pizza no Resumo

Implementado com `react-native-svg` (sem biblioteca extra de gráficos):

- Mostra a distribuição das **despesas** do mês filtrado por categoria.
- Cada fatia usa a cor de fundo (`background`) da própria categoria.
- Legenda com nome da categoria e percentual ao lado do gráfico.
- Quando não há despesas no mês, exibe mensagem informativa no lugar do gráfico.

### 12.5 — Categorias customizadas

A tela **Categorias** permite criar e excluir categorias além das 5 padrão.
Categorias com `isDefault=true` não podem ser excluídas (bloqueio no servidor).

---

## 13. Testar os endpoints no Postman

Importe o arquivo `gestao-financeira-api/postman/collection.json` no Postman.
A collection já tem `baseUrl = http://localhost:3000` e `token` como variáveis.

### Fluxo recomendado

**1. Health-check**
- `GET {{baseUrl}}/`
- Resposta: `{ "ok": true, "name": "gestao-financeira-api" }`

**2. Login**
- `POST {{baseUrl}}/auth/login`
- Body: `{ "email": "admin@gestao.com", "password": "123456" }`
- Resposta: `{ "token": "...", "user": { ... } }`
- **Copie o token e salve na variável `token` do ambiente.**

**3. Listar categorias**
- `GET {{baseUrl}}/categories` — header `Authorization: Bearer {{token}}`
- Deve trazer as 5 categorias do seed. Copie o `id` de `income`.

**4. Criar categoria**
- `POST {{baseUrl}}/categories`
- Body:
  ```json
  { "name": "health", "displayName": "Saúde", "icon": "favorite", "background": "#FFB6B6", "isIncome": false }
  ```
- Resposta: `201 Created` com o objeto criado.

**5. Atualizar categoria**
- `PUT {{baseUrl}}/categories/:id`
- Body: `{ "displayName": "Saúde e Bem-estar" }`

**6. Excluir categoria**
- `DELETE {{baseUrl}}/categories/:id` → `204 No Content`
- Tente excluir `income` → deve retornar `400` com "Categorias padrão não podem ser excluídas".

**7. Criar transação**
- `POST {{baseUrl}}/transactions`
- Body:
  ```json
  { "description": "Salário de outubro", "value": 3500.50, "date": "2026-04-29", "categoryId": "ID_DA_CATEGORIA_INCOME" }
  ```
- Resposta: `201 Created` com `category` aninhada.

**8. Listar transações**
- `GET {{baseUrl}}/transactions`
- Retorna lista com `category` expandida, ordenada por data desc.

**9. Excluir transação**
- `DELETE {{baseUrl}}/transactions/:id` → `204 No Content`

**10. Validar erros**
- `POST {{baseUrl}}/transactions` com body `{ "description": "" }`
- Resposta: `400` com `"error": "Dados inválidos"` e lista de problemas em `details`.

> A collection exportada em `postman/collection.json` já tem todas as requisições
> acima com os headers de autorização configurados.

---

## 14. Comandos resumidos

Partindo de `praticas/gestao-financeira-api/`:

```bash
# 1. Instalar dependências
npm install

# 2. Criar banco (MySQL Workbench)
#    CREATE DATABASE gestao_financeira CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. Criar .env com DATABASE_URL, PORT e JWT_SECRET

# 4. Migrations
npx prisma migrate dev --name init

# 5. Seed (categorias + usuário padrão)
npm run prisma:seed
#    → admin@gestao.com / 123456

# 6. Subir servidor
npm run dev

# 7. (Outro terminal) Prisma Studio
npm run prisma:studio
```

Partindo de `praticas/gestao-financeira/`:

```bash
# 8. Instalar dependências
npm install

# 9. Criar .env com EXPO_PUBLIC_API_URL

# 10. Rodar no emulador Android
npm run android
```

---

## 15. Rodar o app conectado à API (end-to-end)

| Terminal | Pasta | Comando |
|---|---|---|
| 1 | `praticas/gestao-financeira-api/` | `npm run dev` |
| 2 | `praticas/gestao-financeira-api/` (opcional) | `npm run prisma:studio` |
| 3 | `praticas/gestao-financeira/` | `npx expo start --android` |

### Roteiro de smoke-test

1. **Login** — entre com `admin@gestao.com` / `123456`. A mensagem "Olá, Amanda!" aparece no topo da aba Transações.
2. **Filtro** — navegue entre meses com `<` e `>` nas abas Transações e Resumo.
3. **Adicionar transação** — crie uma despesa no mês atual.
4. **Editar** — toque longo na transação → "Editar" → altere a descrição → Salvar.
5. **Excluir** — toque longo → "Excluir" → confirmar.
6. **Resumo / gráfico** — a aba Resumo mostra o gráfico de pizza das despesas do mês.
7. **Categorias** — crie uma categoria personalizada; ela aparece no Picker da aba Adicionar.
8. **Logout** — toque no ícone `↪` no canto superior direito e confirme que volta para a tela de login.
9. **MySQL Workbench** — `SELECT * FROM transaction; SELECT * FROM category; SELECT * FROM user;`

### Validar que vem do servidor

- Pare a API (`Ctrl+C`) e abra o app → tela de erro com "Tentar novamente".
- Religue a API e toque em "Tentar novamente" → dados retornam.
- Cadastre uma transação pelo Postman e faça pull-to-refresh no app — ela aparece.

---

## 16. Status das implementações

> Legenda: ✅ feito · ⬜ pendente (opcional)

### Passo 1 — Higiene de configuração — ✅ feito

- ✅ `tsconfig.json`: removidas as entradas `.jsx` individuais do `include`.
- ✅ `app.json`: `extra.eas.projectId` trocado para `""`.
- ✅ `+not-found.jsx` com botão "Voltar para o início".
- ✅ `tsconfi.json` (typo) excluído.

### Passo 2 — Padronizar imports — ✅ feito

- ✅ Todos os arquivos usam `@/components/...`, `@/contexts/...`, `@/constants/...`, `@/styles/...`, `@/services/...`.
- ✅ Hooks não usados excluídos (`use-color-scheme.*`, `use-theme-color.ts`).

### Passo 3 — Centralizar o estado — ✅ feito

- ✅ `GlobalState` expõe `addTransaction`, `updateTransaction`, `removeTransaction`, `addCategory`, `removeCategory`.
- ✅ IDs gerados pelo banco (`cuid`) — sem `length + 1` no cliente.
- ✅ `AsyncStorage` usado apenas para persistir o token JWT.

### Passo 4 — Dinamizar categorias — ✅ feito

- ✅ `CategoryPicker` itera `categories` da API.
- ✅ `summary.jsx` usa `category.isIncome` sem hardcode.
- ✅ `constants/categories.js` excluído.

### Passo 5 — Integração com a API — ✅ feito

- ✅ API Express + Prisma + MySQL rodando.
- ✅ `services/api.js` com CRUD completo e token JWT.
- ✅ `GlobalState` consome `services/api.js`.
- ✅ `loading`, `error`, pull-to-refresh e estado vazio tratados.

### Passo 6 — Autenticação JWT — ✅ feito

- ✅ Model `User` no banco com senha bcrypt.
- ✅ `POST /auth/login` retorna token JWT (7 dias).
- ✅ Middleware `authenticate` protege `/categories` e `/transactions`.
- ✅ `AuthContext` com `login` / `logout` e persistência via `AsyncStorage`.
- ✅ Tela de login (`app/login.jsx`) com validação.
- ✅ Proteção de rota em `app/_layout.jsx` (redireciona para `/login` sem sessão).
- ✅ Botão de logout no header das tabs.

### Passo 7 — Melhorias de UX — ✅ feito

- ✅ Mensagem de boas-vindas com nome do usuário na aba Transações.
- ✅ Filtro de mês/ano nas abas Transações e Resumo.
- ✅ Edição de transação via toque longo + modal deslizante.
- ✅ Gráfico de pizza (SVG) na aba Resumo com legenda e percentuais.
- ✅ Categorias customizadas além das 5 padrão.
- ✅ Collection Postman exportada em `postman/collection.json`.

### Trilha opcional

- ⬜ Cache offline com `AsyncStorage` como fallback quando a API estiver fora.
- ⬜ Registro de novos usuários (tela de cadastro + `POST /auth/register`).
- ⬜ Refresh token para renovar sessão sem novo login.
- ⬜ Tela de perfil para alterar nome/senha.
