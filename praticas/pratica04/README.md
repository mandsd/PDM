# 💻 Prática 04: Rolagem Infinita e App que Não Esquece

Nesta prática, vamos melhorar a usabilidade do nosso App de Tarefas. Vamos substituir a nossa lista rudimentar por uma lista nativa de alta performance e conectar o nosso aplicativo ao armazenamento interno do celular.

## 🛠️ O que deve ser feito

1. **Siga o Fluxo:** Crie a Issue da Prática 04, crie a branch `feature/pratica04` e rode o projeto (`npx expo start`).
2. **Refatoração para FlatList:** * Remova o `.map()` que você usou na prática passada.
   * Importe o componente `<FlatList>` do `react-native`.
   * Configure a `FlatList` passando o seu estado `tasks` para a prop `data`.
   * Passe a função que desenha o seu card de tarefa para a prop `renderItem`. Teste adicionando 15 tarefas e veja a mágica da rolagem acontecer!
3. **Instale o AsyncStorage:** Pare o servidor no terminal (Ctrl+C) e rode o comando:
   ```bash
   npx expo install @react-native-async-storage/async-storage
   ```
4. **Crie a Função de Salvar:**
- Crie uma função assíncrona chamada `saveTasks()`.
- Toda vez que você adicionar ou deletar uma tarefa, chame o `AsyncStorage.setItem()` para guardar a nova lista atualizada (não esqueça de usar `JSON.stringify`).

5. **Crie a Função de Carregar:**
- Crie uma função assíncrona chamada `loadTasks()`.
- Use o `AsyncStorage.getItem()` para buscar as tarefas salvas. Se existirem, use o `JSON.parse` e coloque-as no seu estado usando o `setTasks()`.

6. **O Toque Final (useEffect):**
- Importe o `useEffect` do `react`.
- Configure o `useEffect` com um array de dependências vazio `[]` para chamar a função loadTasks() assim que o aplicativo for aberto.

✅ **Como Entregar**
- **Teste Extremo:** Abra o seu aplicativo no celular, adicione 3 tarefas. Feche o aplicativo completamente (remova da lista de apps recentes) e abra de novo. As tarefas precisam continuar lá!
- Faça o commit: `git commit -m "Feat: Adiciona FlatList e AsyncStorage para persistir tarefas"`
- Faça o push para o GitHub e abra o seu **Pull Request** para a revisão!
