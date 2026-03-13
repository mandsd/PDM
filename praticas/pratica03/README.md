# 💻 Prática 03: Dando Vida ao App (Adicionar e Deletar Tarefas)

Chegou a hora da verdade! Vamos conectar a interface que construímos na Prática 02 com a lógica do React. Ao final desta prática, você conseguirá digitar uma tarefa, adicioná-la à lista na tela e excluí-la.

## 🛠️ O que deve ser feito

1. **Siga o Fluxo:** Crie a Issue da Prática 03, crie a branch `feature/pratica03`, instale as dependências e rode o projeto (`npx expo start`).
2. **Crie os Estados:** No topo do seu componente `App`, crie dois estados:
   * Um para armazenar o texto que o usuário está digitando (ex: `taskText`).
   * Um para armazenar o array/lista de tarefas (ex: `tasks`). Comece com um array vazio `[]`.
3. **Capture a Digitação:** No seu `<TextInput>`, adicione as propriedades `value={taskText}` e `onChangeText={setTaskText}`. Agora o input reflete o estado!
4. **Função de Adicionar:** Crie uma função `handleAdd()`. Ela deve:
   * Verificar se o input não está vazio.
   * Criar um objeto para a nova tarefa com um ID único (dica: use `Date.now().toString()`) e o texto digitado.
   * Usar a função de atualizar o array (Spread Operator `...`) para adicionar a tarefa.
   * Limpar o `taskText` para esvaziar o input.
5. **Renderize a Lista:** Em vez de usar cards "hardcoded", use a função `.map()` no seu array de `tasks` para renderizar os itens dinamicamente na tela. *(Aviso: Se a lista ficar muito grande, ela não vai rolar a tela ainda, resolveremos isso na próxima aula!)*
6. **Função de Deletar:** Crie uma função `handleDelete(id)`. Ela deve usar o `.filter()` para remover a tarefa com o ID correspondente e atualizar o estado da lista. Passe essa função para o botão de "X" de cada card.

## ✅ Como Entregar
1. Teste no seu celular: Adicione 3 tarefas diferentes e tente deletar a do meio.
2. Faça o commit: `git commit -m "Feat: Implementa useState para adicionar e remover tarefas"`
3. Faça o push para o GitHub e abra o seu **Pull Request** para a revisão do professor!