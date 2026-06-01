# Tutorial — API REST com Express + Prisma + MySQL para o app `gestao-financeira`

Este tutorial leva você do zero até um servidor Node.js conversando com MySQL e o app
React Native (`praticas/gestao-financeira/`) consumindo essa API. **Sem Docker** — vamos usar o
MySQL instalado localmente na sua máquina.

> Pré-requisitos: Node.js LTS instalado, MySQL Server instalado (usuário `root`, senha `Senha10adaps`)
> e o **MySQL Workbench** (ou DBeaver) para inspecionar o banco. Recomendado também: **Postman**
> ou **Insomnia** para testar os endpoints.

---

## Sumário

1. [Visão geral da arquitetura](#1-visão-geral-da-arquitetura)
2. [Criar o projeto da API](#2-criar-o-projeto-da-api)
3. [Configurar o Prisma com MySQL](#3-configurar-o-prisma-com-mysql)
4. [Modelar `Category` e `Transaction`](#4-modelar-category-e-transaction)
5. [Rodar a primeira migration](#5-rodar-a-primeira-migration)
6. [Popular categorias iniciais (seed)](#6-popular-categorias-iniciais-seed)
7. [Estrutura de pastas e código do servidor](#7-estrutura-de-pastas-e-código-do-servidor)
8. [Subir o servidor e ver no Prisma Studio](#8-subir-o-servidor-e-ver-no-prisma-studio)
9. [Conectar o app `gestao-financeira` à API](#9-conectar-o-app-gestao-financeira-à-api)
10. [Tela "Categorias" no app — cadastro de novas categorias](#10-tela-categorias-no-app--cadastro-de-novas-categorias)
11. [Testar os endpoints no Postman](#11-testar-os-endpoints-no-postman)
12. [Comandos resumidos](#12-comandos-resumidos)
13. [Rodar o app conectado à API (end-to-end)](#13-rodar-o-app-conectado-à-api-end-to-end)
14. [Parte 4 — Estratégia para os pontos de atenção](#14-parte-4--estratégia-para-os-pontos-de-atenção)

---

## 1. Visão geral da arquitetura

```
[ App React Native ]  --HTTP-->  [ API Express ]  --Prisma-->  [ MySQL ]
   gestao-financeira/             gestao-financeira-api/         localhost:3306
```

- O app **não** fala mais com o banco direto. Ele faz `fetch` para a API.
- A API expõe rotas REST (`/categories`, `/transactions`).
- O **Prisma** é o ORM: traduz JavaScript em SQL, sem você precisar escrever SQL manualmente.

---

## 2. Criar o projeto da API

A API ficará **ao lado** do app, dentro de `praticas/`:

```
praticas/
├─ gestao-financeira/        <-- app (já existe)
└─ gestao-financeira-api/    <-- vamos criar agora
```

Abra um terminal **na pasta `praticas/`** e rode:

```bash
mkdir gestao-financeira-api
cd gestao-financeira-api
npm init -y
```

Instale as dependências de produção e desenvolvimento:

```bash
npm install express cors zod dotenv @prisma/client
npm install --save-dev prisma nodemon
```

Abra o `package.json` recém-criado e ajuste a seção `scripts` e adicione `"type": "module"`:

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

> O `"type": "module"` permite usar `import` / `export` em vez de `require`.

---

## 3. Configurar o Prisma com MySQL

Antes de tudo, **crie o banco vazio** no MySQL. Abra o **MySQL Workbench**, conecte com o usuário `root`/`Senha10adaps` e execute:

```sql
CREATE DATABASE gestao_financeira CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Agora, dentro de `gestao-financeira-api/`, 
Instalar dependências do primas (VERSÕES FIXAS):
```bash
npm install prisma@5.22.0 @prisma/client@5.22.0
```

inicialize o Prisma:
```bash
npx prisma init --datasource-provider mysql
```

Isso cria `prisma/schema.prisma` e um `.env` na raiz. Edite o `.env`:

```env
DATABASE_URL="mysql://root:iesb@localhost:3306/gestao_financeira"
PORT=3000
```

Gerar Prisma Client:

```bash
npx prisma generate
```

> **Senhas com caracteres especiais:** se sua senha tivesse `@`, `#`, etc., seria preciso URL-encodar.
> `Senha10adaps` é alfanumérica, então pode ir como está.

Crie também um `.env.example` (sem a senha verdadeira) para versionar:

```env
DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/gestao_financeira"
PORT=3000
```

E um `.gitignore`:

```
node_modules
.env
```

---

## 4. Modelar `Category` e `Transaction`

Substitua todo o conteúdo de `prisma/schema.prisma` por:

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
```

**Pontos importantes para entender:**
- `cuid()` gera IDs únicos automaticamente (substitui o frágil `length + 1` do app).
- `Decimal(12, 2)` é o tipo correto para dinheiro — nunca use `Float`.
- `isIncome` no banco substitui o `if (category === "income")` espalhado pelo front.
- `isDefault` marca categorias semente que não devem ser apagadas.

---

## 5. Rodar a primeira migration

Com o banco já criado e o schema pronto:

```bash
npx prisma migrate dev --name init
```

O Prisma vai:
1. Comparar seu `schema.prisma` com o banco e gerar o SQL automaticamente.
2. Salvar o SQL gerado em `prisma/migrations/`.
3. Aplicar no MySQL.
4. Gerar o **Prisma Client** (a biblioteca que você importa no código).

Confira no MySQL Workbench: as tabelas `Category`, `Transaction` e `_prisma_migrations` devem
aparecer dentro do database `gestao_financeira`.

---

## 6. Popular categorias iniciais (seed)

Crie `prisma/seed.js` para inserir as 5 categorias que o app já usa hoje:

```js
// prisma/seed.js
import { PrismaClient } from "@prisma/client";

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
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }
  console.log("Seed concluído.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

Rode:

```bash
npm run prisma:seed
```

> `upsert` cria se não existir e ignora se já existir — pode rodar quantas vezes quiser sem
> duplicar.

---

## 7. Estrutura de pastas e código do servidor

Estrutura final do projeto da API:

```
gestao-financeira-api/
├─ prisma/
│  ├─ schema.prisma
│  ├─ seed.js
│  └─ migrations/        (gerado pelo Prisma)
├─ src/
│  ├─ server.js
│  ├─ lib/
│  │  └─ prisma.js
│  ├─ middlewares/
│  │  └─ errorHandler.js
│  ├─ routes/
│  │  ├─ categories.js
│  │  └─ transactions.js
│  └─ schemas/
│     ├─ categorySchema.js
│     └─ transactionSchema.js
├─ .env
├─ .env.example
├─ .gitignore
└─ package.json
```

### 7.1 — Cliente Prisma único

```js
// src/lib/prisma.js
import { PrismaClient } from "@prisma/client";

/**
 * Instância única do PrismaClient compartilhada por toda a aplicação.
 * Criar várias instâncias abre conexões demais com o banco.
 */
export const prisma = new PrismaClient();
```

### 7.2 — Middleware de erro

```js
// src/middlewares/errorHandler.js
/**
 * Middleware central de erro do Express.
 * Captura tudo que cair em next(error) e devolve JSON consistente.
 */
export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "ZodError") {
    return res.status(400).json({ error: "Dados inválidos", details: err.issues });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Recurso não encontrado" });
  }
  if (err.code === "P2002") {
    return res.status(409).json({ error: "Registro duplicado" });
  }

  res.status(500).json({ error: "Erro interno do servidor" });
}
```

### 7.3 — Validações Zod

```js
// src/schemas/categorySchema.js
import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2),
  displayName: z.string().min(2),
  icon: z.string().min(1),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor hex inválida"),
  isIncome: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
```

```js
// src/schemas/transactionSchema.js
import { z } from "zod";

export const createTransactionSchema = z.object({
  description: z.string().min(1),
  value: z.number().positive(),
  date: z.coerce.date(),
  categoryId: z.string().min(1),
});

export const updateTransactionSchema = createTransactionSchema.partial();
```

### 7.4 — Rotas de categorias

```js
// src/routes/categories.js
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/categorySchema.js";

const router = Router();

// GET /categories - lista todas as categorias
router.get("/", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayName: "asc" },
    });
    res.json(categories);
  } catch (e) { next(e); }
});

// POST /categories - cria uma nova categoria
router.post("/", async (req, res, next) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
  } catch (e) { next(e); }
});

// PUT /categories/:id - atualiza categoria existente
router.put("/:id", async (req, res, next) => {
  try {
    const data = updateCategorySchema.parse(req.body);
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data,
    });
    res.json(category);
  } catch (e) { next(e); }
});

// DELETE /categories/:id - remove categoria (bloqueia se for padrão)
router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.category.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return res.status(404).json({ error: "Categoria não encontrada" });
    if (existing.isDefault) {
      return res.status(400).json({ error: "Categorias padrão não podem ser excluídas" });
    }
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;
```

### 7.5 — Rotas de transações

```js
// src/routes/transactions.js
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../schemas/transactionSchema.js";

const router = Router();

// GET /transactions - lista todas com a categoria expandida
router.get("/", async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { category: true },
      orderBy: { date: "desc" },
    });
    res.json(transactions);
  } catch (e) { next(e); }
});

// POST /transactions - cria uma nova transação
router.post("/", async (req, res, next) => {
  try {
    const data = createTransactionSchema.parse(req.body);
    const transaction = await prisma.transaction.create({
      data,
      include: { category: true },
    });
    res.status(201).json(transaction);
  } catch (e) { next(e); }
});

// PUT /transactions/:id
router.put("/:id", async (req, res, next) => {
  try {
    const data = updateTransactionSchema.parse(req.body);
    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data,
      include: { category: true },
    });
    res.json(transaction);
  } catch (e) { next(e); }
});

// DELETE /transactions/:id
router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;
```

### 7.6 — Servidor

```js
// src/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import categoriesRouter from "./routes/categories.js";
import transactionsRouter from "./routes/transactions.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, name: "gestao-financeira-api" }));

app.use("/categories", categoriesRouter);
app.use("/transactions", transactionsRouter);

app.use(errorHandler);

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
```

---

## 8. Subir o servidor e ver no Prisma Studio

Em **dois terminais separados** dentro de `gestao-financeira-api/`:

```bash
# Terminal 1 - servidor
npm run dev
```

```bash
# Terminal 2 - interface visual do banco (abre no navegador em http://localhost:5555)
npm run prisma:studio
```

Abra o navegador em `http://localhost:3000/` e você verá `{ "ok": true, "name": "gestao-financeira-api" }`.

---

## 9. Conectar o app `gestao-financeira` à API

A integração tem **três peças**: um cliente HTTP (`services/api.js`), um Provider de
estado central (`contexts/GlobalState.jsx`) e uma variável de ambiente que diz ao
app onde a API está rodando (`.env`). O `AsyncStorage` foi removido do fluxo
principal — a fonte de verdade agora é o MySQL.

### 9.1 — `services/api.js` (cliente HTTP)

Dentro de `praticas/gestao-financeira/`, crie a pasta `services/` e o arquivo
`api.js`. Ele centraliza toda a comunicação com o servidor:

```js
// services/api.js

/**
 * URL base da API.
 *
 * - No emulador Android, "localhost" do app aponta para o próprio emulador,
 *   por isso usamos 10.0.2.2 (IP especial que o Android mapeia para o
 *   localhost da máquina hospedeira).
 * - Em device físico, troque para o IP da sua máquina na rede local
 *   (ex.: http://192.168.0.10:3000) — descubra com `ipconfig` no Windows.
 * - Para iOS Simulator, "http://localhost:3000" funciona normalmente.
 *
 * Você pode sobrescrever via variável de ambiente do Expo (EXPO_PUBLIC_API_URL).
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  listCategories:    ()        => request("/categories"),
  createCategory:    (data)    => request("/categories",        { method: "POST",   body: JSON.stringify(data) }),
  updateCategory:    (id, d)   => request(`/categories/${id}`,  { method: "PUT",    body: JSON.stringify(d) }),
  deleteCategory:    (id)      => request(`/categories/${id}`,  { method: "DELETE" }),

  listTransactions:  ()        => request("/transactions"),
  createTransaction: (data)    => request("/transactions",       { method: "POST",   body: JSON.stringify(data) }),
  updateTransaction: (id, d)   => request(`/transactions/${id}`, { method: "PUT",    body: JSON.stringify(d) }),
  deleteTransaction: (id)      => request(`/transactions/${id}`, { method: "DELETE" }),
};
```

### 9.2 — Configurar a URL via `.env`

Crie um arquivo `.env.example` na raiz de `gestao-financeira/`:

```env
# URL base da API gestao-financeira-api.
#
# Emulador Android (default): http://10.0.2.2:3000
# Device físico Android:      http://IP_DA_SUA_MAQUINA:3000  (descubra com `ipconfig`)
# iOS Simulator:              http://localhost:3000
# Web (expo start --web):     http://localhost:3000
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

Para ativar, copie para `.env`:

```bash
cp .env.example .env   # ou simplesmente Copiar/Colar no Explorer do Windows
```

> Variáveis com prefixo `EXPO_PUBLIC_` ficam disponíveis em `process.env` no
> bundle do app. Sem esse prefixo, o Expo não as expõe ao cliente.

### 9.3 — `contexts/GlobalState.jsx` (estado central)

O Provider passa a hidratar tudo da API e a expor **ações** em vez do `setState`
cru. Isso elimina o `AsyncStorage` e centraliza a lógica de loading/erro:

```jsx
// contexts/GlobalState.jsx (essência)
import { createContext, useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export const MoneyContext = createContext();

export default function GlobalState({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [cats, txs] = await Promise.all([
        api.listCategories(),
        api.listTransactions(),
      ]);
      setCategories(cats);
      setTransactions(txs);
    } catch (e) {
      setError(e.message ?? "Falha ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addTransaction    = useCallback(async (data) => { /* POST + setTransactions */ }, []);
  const removeTransaction = useCallback(async (id)   => { /* DELETE + filter */ },        []);
  const addCategory       = useCallback(async (data) => { /* POST + setCategories */ },   []);
  const removeCategory    = useCallback(async (id)   => { /* DELETE + filter */ },        []);

  return (
    <MoneyContext.Provider value={{
      transactions, categories, loading, error, refresh,
      addTransaction, removeTransaction, addCategory, removeCategory,
    }}>
      {children}
    </MoneyContext.Provider>
  );
}
```

> O contexto agora retorna um **objeto** (com chaves nomeadas), não mais um
> array tipo `useState`. Em todas as telas, troque
> `const [tx] = useContext(MoneyContext)` por
> `const { transactions, addTransaction, ... } = useContext(MoneyContext)`.

### 9.4 — O que muda nas telas existentes

| Tela | O que mudou |
|---|---|
| `app/(tabs)/index.jsx` (Transações) | Mostra `ActivityIndicator` enquanto carrega; tela de erro com botão "Tentar novamente"; **pull-to-refresh** com `RefreshControl`; **long-press** numa transação abre Alert para excluir. |
| `app/(tabs)/add-transactions.jsx` | Não toca mais em `AsyncStorage`. Ao salvar, chama `addTransaction({...})` do contexto. Categoria default é dinâmica (primeira `isIncome`). Botão mostra "Salvando..." enquanto o POST roda. |
| `app/(tabs)/summary.jsx` | Itera `categories.map(...)` — sem hardcode dos 5 nomes. Saldo usa `category.isIncome` em vez de comparar string. |
| `components/CategoryItem`, `SummaryItem`, `TransactionItem` | Recebem **a categoria como objeto** (vem expandida do back-end), não mais como string. Como o Prisma serializa `Decimal` como string, é feito `Number(value)` antes de formatar em BRL. |
| `components/CategoryPicker.jsx` | Itera as categorias do contexto em vez de listar 5 `<Picker.Item>` manualmente. |
| `constants/categories.js` | **Apagado** — não há mais lista hardcoded; a fonte é o banco. |
| `constants/colors.js` | `negativesText` renomeado para `negativeText` (tira o "s" extra) e propagado em `globalStyles`. |

---

## 10. Tela "Categorias" no app — cadastro de novas categorias

Antes da integração, as 5 categorias eram fixas no código (`constants/categories.js`).
Agora elas vêm do MySQL e o usuário pode **criar e excluir categorias direto pelo
app**, em uma nova aba dedicada.

### 10.1 — Nova aba "Categorias" no `_layout.jsx`

A barra de abas foi atualizada para incluir a tela. A ordem ficou:
**Transações · Categorias · (+) Adicionar · Resumo**.

```jsx
<Tabs.Screen
  name="categories"
  options={{
    title: "Categorias",
    tabBarIcon: ({ color }) => (
      <MaterialIcons name="category" size={26} color={color} />
    ),
  }}
/>
```

### 10.2 — Tela `app/(tabs)/categories.jsx`

A tela tem três blocos principais:

1. **Formulário de criação** — campos `name` (identificador técnico, ex.: `health`),
   `displayName` (rótulo exibido, ex.: `Saúde`), `icon` (nome de Material Icon,
   ex.: `favorite`) e uma paleta de **cores sugeridas** (clique para escolher).
   Ao confirmar, chama `addCategory({...})` do contexto, que faz `POST /categories`
   e adiciona a categoria à lista local.
2. **Lista de categorias** — todas vindas do servidor, ordenadas por `displayName`,
   com badge "padrão" / "personalizada" e tag "receita" quando `isIncome=true`.
3. **Botão de excluir** — aparece apenas em categorias `isDefault=false`.
   Ao confirmar, chama `removeCategory(id)`, que faz `DELETE /categories/:id`.
   Se houver transações usando essa categoria, o servidor retorna **400** e a
   exclusão é bloqueada (FK `Transaction.categoryId → Category.id`).

Esqueleto da chamada de criação:

```jsx
const { categories, addCategory, removeCategory } = useContext(MoneyContext);

const handleCreate = async () => {
  await addCategory({
    name: "health",
    displayName: "Saúde",
    icon: "favorite",
    background: "#FFB6B6",
    isIncome: false,
  });
};
```

### 10.3 — Regras importantes

- **Categorias padrão (`isDefault=true`)** são as 5 inseridas pelo `seed.js`
  (income/food/house/education/travel). O servidor barra a exclusão delas com
  `400 Bad Request` ("Categorias padrão não podem ser excluídas").
- O nome **técnico** (`name`) precisa ser único — é o que diferencia categorias
  no banco. O `displayName` é só rótulo e pode repetir.
- Ao criar uma categoria personalizada, ela aparece imediatamente:
  - na lista da própria tela "Categorias",
  - no `<Picker>` da tela "Adicionar Transação",
  - no "Resumo" (com total `R$ 0,00` até existir transação dela).

> **Por que isso é importante para a Parte 4 do tutorial:** este passo executa
> o que estava previsto como **Passo 4** ("dinamizar categorias no front") e
> **Passo 5.4** ("criar tela 'Gerenciar categorias'"). Adicionar uma categoria
> nova hoje é **um único registro** no banco — sem alterar código.

---

## 11. Testar os endpoints no Postman

Antes de mexer no app, garanta que a API está saudável usando o Postman.

1. Abra o Postman e crie uma **Collection** chamada `Gestão Financeira API`.
2. Configure uma variável de ambiente `baseUrl = http://localhost:3000`.
3. Crie as requisições abaixo (use sempre `Body > raw > JSON` quando enviar corpo):

### 10.1 — Health-check

- **GET** `{{baseUrl}}/`
- Resposta esperada: `{ "ok": true, "name": "gestao-financeira-api" }`

### 10.2 — Listar categorias

- **GET** `{{baseUrl}}/categories`
- Deve trazer as 5 categorias inseridas pelo seed.
- **Copie o `id` da categoria `income`** (você vai usar no próximo teste).

### 10.3 — Criar uma nova categoria

- **POST** `{{baseUrl}}/categories`
- Body:
  ```json
  {
    "name": "health",
    "displayName": "Saúde",
    "icon": "favorite",
    "background": "#FFB6B6",
    "isIncome": false
  }
  ```
- Resposta esperada: `201 Created` com o objeto criado (incluindo o `id` gerado).

### 10.4 — Atualizar categoria

- **PUT** `{{baseUrl}}/categories/:id` (substitua `:id` pelo retornado em 10.3)
- Body:
  ```json
  { "displayName": "Saúde e Bem-estar" }
  ```

### 10.5 — Excluir categoria

- **DELETE** `{{baseUrl}}/categories/:id`
- Resposta esperada: `204 No Content`.
- Tente excluir uma categoria padrão (ex.: `income`) e confirme que vem `400` com mensagem
  "Categorias padrão não podem ser excluídas".

### 10.6 — Criar transação

- **POST** `{{baseUrl}}/transactions`
- Body (use o `id` da categoria `income` capturado em 10.2):
  ```json
  {
    "description": "Salário de outubro",
    "value": 3500.50,
    "date": "2026-04-29",
    "categoryId": "COLE_AQUI_O_ID_DA_CATEGORIA"
  }
  ```
- Resposta esperada: `201 Created` já com `category` aninhada.

### 10.7 — Listar transações

- **GET** `{{baseUrl}}/transactions`
- Deve listar a transação criada com a `category` expandida.

### 10.8 — Excluir transação

- **DELETE** `{{baseUrl}}/transactions/:id`
- Resposta esperada: `204 No Content`.

### 10.9 — Validar erros

- **POST** `{{baseUrl}}/transactions` com body inválido:
  ```json
  { "description": "" }
  ```
- Deve voltar `400` com `"error": "Dados inválidos"` e a lista de problemas em `details` — é o
  Zod barrando a entrada.

> **Dica:** exporte essa Collection (`Postman > ... > Export`) e versione no repositório, em
> `gestao-financeira-api/postman/collection.json`. Toda a turma testa do mesmo jeito.

---

## 12. Comandos resumidos

Tudo que o aluno vai digitar, em ordem, partindo da pasta `praticas/`:

```bash
# 1. Criar e configurar o projeto
mkdir gestao-financeira-api
cd gestao-financeira-api
npm init -y
npm install express cors zod dotenv @prisma/client
npm install --save-dev prisma nodemon

# 2. (No MySQL Workbench, antes de continuar)
#    CREATE DATABASE gestao_financeira CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. Inicializar Prisma
npx prisma init --datasource-provider mysql
#    -> editar .env com DATABASE_URL e
#       editar prisma/schema.prisma com os models

# 4. Migration + seed
npx prisma migrate dev --name init
npm run prisma:seed

# 5. Subir o servidor
npm run dev

# 6. (Outro terminal) abrir Prisma Studio
npm run prisma:studio

# 7. Configurar o app (na pasta gestao-financeira/)
#    copie .env.example para .env e ajuste EXPO_PUBLIC_API_URL se for device físico
```

---

## 13. Rodar o app conectado à API (end-to-end)

Com a API testada no Postman, é hora de ver o fluxo completo no celular.

### 13.1 — Suba os dois projetos em paralelo

| Terminal | Pasta | Comando |
|---|---|---|
| 1 | `praticas/gestao-financeira-api/` | `npm run dev` |
| 2 | `praticas/gestao-financeira-api/` (opcional) | `npm run prisma:studio` |
| 3 | `praticas/gestao-financeira/` | `npx expo start` |

### 13.2 — Configurar a URL da API no app

Na pasta `gestao-financeira/`, copie `.env.example` para `.env` e ajuste se
necessário:

```env
# Emulador Android (default já funciona)
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000

# Device físico Android (descubra seu IP com `ipconfig`):
# EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
```

> **Importante:** depois de criar/alterar o `.env`, pare o `expo start` e
> reinicie. As variáveis `EXPO_PUBLIC_*` só são lidas no início do bundling.

### 13.3 — Roteiro de smoke-test no app

1. **Aba "Categorias"** — confirme que aparecem as 5 categorias padrão
   (Renda, Alimentação, Casa, Educação, Viagens). Crie uma nova, ex.:
   `name: transport`, `displayName: Transporte`, `icon: directions-car`,
   cor verde claro.
2. **Aba "Adicionar Transação"** — abra o `<Picker>` de categoria; a nova
   categoria "Transporte" deve estar lá. Cadastre uma despesa, ex.:
   `Uber para o IESB · R$ 25,50 · hoje · Transporte`.
3. **Aba "Transações"** — a transação aparece na lista. Faça **pull-to-refresh**
   (puxar de cima para baixo) para confirmar que ela ainda está lá depois de
   uma nova consulta ao servidor. Faça **long-press** na transação para
   excluir.
4. **Aba "Resumo"** — o total da categoria "Transporte" reflete o valor
   somado, e o saldo (Renda − despesas) está correto.
5. **MySQL Workbench** — rode `SELECT * FROM transaction;` e
   `SELECT * FROM category;` para ver os mesmos dados gravados no banco.

### 13.4 — Como validar que está realmente vindo do servidor (e não do cache)

- Pare o servidor (`Ctrl+C` no terminal 1) e abra o app — deve aparecer a
  tela de erro com botão "Tentar novamente".
- Religue o servidor e toque em "Tentar novamente" — os dados retornam.
- Cadastre uma transação pelo Postman (seção 11.6) e faça pull-to-refresh no
  app; ela aparece na lista. **É o banco quem manda.**

### 13.5 — Aviso sobre dados antigos do `AsyncStorage`

Se você já usava o app antes da integração, podem ter ficado transações
salvas no `AsyncStorage` do device (cache local). Como o app **não lê mais
de lá**, esses dados ficam órfãos: deixam de ser exibidos. Para limpar de
vez, é possível desinstalar o app do emulador ou rodar
`AsyncStorage.clear()` em alguma chamada de teste — não é obrigatório,
apenas higiênico.

---

## 14. Parte 4 — Estratégia para os pontos de atenção

A integração com a API resolveu os pontos críticos do app (id frágil e categorias hardcoded). Esta seção marca o que **já foi executado** seguindo este tutorial e o que ainda fica como **trilha opcional**.

> Legenda: ✅ feito · 🟡 parcial · ⬜ pendente

### Passo 1 — Higiene de configuração (baixo risco) — ✅ feito

- ✅ `tsconfig.json`: removidas as entradas `.jsx` individuais do `include`; mantidos apenas os patterns padrão.
- ✅ `app.json`: `extra.eas.projectId` trocado para `""` — aluno deve rodar `eas init` antes de buildar.
- ✅ `+not-found.jsx` virou tela com botão "Voltar para o início" usando `router.replace("/")`.
- ✅ `tsconfi.json` (typo) excluído.

### Passo 2 — Padronizar imports (baixo risco, alto ganho de leitura) — ✅ feito

- ✅ Todos os arquivos do app usam `@/components/...`, `@/contexts/...`, `@/constants/...`, `@/styles/...`, `@/services/...`.
- ✅ Hooks não usados (`use-color-scheme.ts`, `use-color-scheme.web.ts`, `use-theme-color.ts`) excluídos.
- ✅ `paths` do `tsconfig.json` e imports reais estão consistentes.

### Passo 3 — Centralizar o estado (risco médio) — ✅ feito

- ✅ Toda escrita migrou para o `GlobalState`, que expõe **ações** em vez de `setState` cru:
  ```jsx
  const { transactions, categories, loading, error, refresh,
          addTransaction, removeTransaction,
          addCategory, removeCategory } = useContext(MoneyContext);
  ```
- ✅ `id: transactions.length + 1` foi substituído pelos `cuid` que a API devolve — não há mais geração de id no cliente.
- ✅ `AsyncStorage` foi removido do fluxo principal. A fonte de verdade é o MySQL via API. (Voltar com `AsyncStorage` como **cache offline** é um upgrade opcional descrito no fim desta seção.)

### Passo 4 — Dinamizar categorias no front (risco médio) — ✅ feito

- ✅ `CategoryPicker` agora itera `categories.map(...)` em vez de listar 5 `<Picker.Item>` manualmente.
- ✅ `summary.jsx` constrói totais e `<SummaryItem>` com `reduce`/`map`, sem nomes hardcoded.
- ✅ A condição "é renda?" saiu dos componentes (`category === "income"`) e agora vem do dado (`category.isIncome`).
- ✅ `colors.negativesText` virou `colors.negativeText` (com o `globalStyles` atualizado).
- ✅ `constants/categories.js` foi excluído — a fonte é o banco.

### Passo 5 — Integração com a API (maior mudança) — ✅ feito

- ✅ Projeto `gestao-financeira-api/` rodando (Express + Prisma + MySQL).
- ✅ `services/api.js` criado (seção 9.1) com CRUD completo de categorias e transações.
- ✅ `GlobalState.jsx` consome `services/api.js`.
- ✅ Tela `app/(tabs)/categories.jsx` (seção 10) — listar, criar, excluir categorias.
- ✅ `loading`, `error` e estado vazio tratados nas telas Transações, Adicionar e Resumo (`ActivityIndicator`, mensagem de erro com "Tentar novamente", `RefreshControl` com pull-to-refresh em Transações).

### Considerações que valem virar regra do curso

- **`newArchEnabled` + `reactCompiler`** estão ligados em `app.json`. Qualquer biblioteca nativa nova precisa estar com suporte à new architecture documentado. Prefira libs do próprio Expo SDK ou `@react-native-*` mantidas pela community.
- **Autenticação de usuários** ficou **fora** desta etapa de propósito. É bola de neve (modelo `User`, JWT, refresh tokens, telas de login). Trilha natural para um próximo módulo agora que o CRUD + categorias dinâmicas estão sólidos.
- **AsyncStorage como cache offline** vale como upgrade: encapsular leitura/escrita em `lib/storage.js`, popular ao receber dados da API e usar como fallback quando o servidor estiver fora. Não é necessário para o fluxo funcionar, mas melhora a percepção de velocidade e tolera quedas curtas de rede.
- **Atualização (PUT) de transação no app** ainda não tem tela. O endpoint existe e o `services/api.js` já expõe `updateTransaction(id, data)` — falta apenas uma tela de edição no front (próximo exercício natural).