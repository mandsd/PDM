# 📚 Aula 03: Estado, Interatividade e Imutabilidade

Na aula anterior, desenhamos a interface do nosso App de Tarefas. No entanto, se você tentar digitar algo ou clicar no botão de adicionar, nada acontece. Por quê? Porque interfaces React são "burras" por padrão. Elas precisam de um **Estado** para saber quando devem se atualizar.

## 🎯 Objetivos da Aula
* Entender a diferença entre uma variável comum e um Estado (`useState`).
* Compreender o conceito de Imutabilidade no React.
* Aprender a capturar textos do usuário no mobile.

## 🧠 O que é o Estado (`useState`)?
No React Native, se você criar uma variável comum (`let nome = 'Maria'`) e depois mudá-la para `'João'`, a tela **não** vai ser atualizada. 

Para que o React perceba a mudança e redesenhe a tela (re-renderização), precisamos usar o Hook `useState`:


```javascript
import { useState } from 'react';

// Criando um estado
const [tarefa, setTarefa] = useState('');

```
- `tarefa`: É a variável que guarda o valor atual (o que o usuário digitou).
- `setTarefa`: É a função "mágica" que usamos para alterar o valor. Sempre que ela é chamada, a tela é atualizada!

## 🛡️ A Regra de Ouro: Imutabilidade
- No React, **nunca modificamos um estado diretamente**, nós o substituímos.
- Se você tem uma lista de tarefas, você NÃO PODE fazer isso:
```js
// ❌ ERRADO! O React não vai atualizar a tela.
minhasTarefas.push("Nova Tarefa");
```
- Você DEVE criar uma cópia da lista antiga, adicionar o item novo e substituir tudo:
```js
// ✅ CERTO! Mantém todos os itens, exceto o que tem o ID clicado
const novaLista = minhasTarefas.filter(item => item.id !== idClicado);
setMinhasTarefas(novaLista);
```
