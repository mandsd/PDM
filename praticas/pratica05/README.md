# 💻 Prática 05: Arrumando a Casa (Refatoração)

Nesta prática, nosso aplicativo não vai ganhar nenhuma funcionalidade nova para o usuário final. O objetivo aqui é melhorar a **qualidade do código**. Vamos extrair o visual da nossa tarefa para um componente separado, deixando o nosso `App.js` muito mais limpo e profissional.

## 🛠️ O que deve ser feito

1. **Siga o Fluxo:** Crie a Issue da Prática 05, crie a branch `feature/pratica05` e rode o projeto (`npx expo start`).
2. **Crie a Estrutura de Pastas:** Na raiz do seu projeto, crie uma pasta chamada `src`. Dentro de `src`, crie uma pasta chamada `components`.
3. **Crie o Componente Card:** * Dentro de `src/components`, crie um arquivo chamado `TaskCard.js` (ou `.jsx`).
   * Recorte todo o código JSX (a `<View>`, o `<Text>` e o `<TouchableOpacity>`) que representa uma tarefa isolada lá do seu `App.js` e cole dentro deste novo arquivo.
   * Não esqueça de recortar os estilos (`StyleSheet`) referentes ao card e levá-los para este arquivo também!
4. **Configure as Props:**
   * O seu `TaskCard` precisa receber duas informações do pai para funcionar: o texto da tarefa e a função que será chamada ao clicar no botão de deletar.
   * Configure o componente para receber `{ title, onDelete }` via **props**.
5. **Importe no App.js:**
   * Volte ao seu `App.js` e importe o componente recém-criado: `import { TaskCard } from './src/components/TaskCard';`
   * Na sua `FlatList`, substitua o código antigo pela chamada do novo componente, passando as props corretamente:
   ```javascript
   renderItem={({ item }) => (
      <TaskCard 
         title={item.task} 
         onDelete={() => handleDelete(item.id)} 
      />
   )}
   ```
✅ **Como Entregar**
1. **Teste de Regressão**: Teste o app no seu celular. Ele **deve continuar funcionando exatamente igual** à aula passada (adicionando, deletando e salvando). Se algo parou, revise suas Props!
2. Faça o commit: `git commit -m "Refactor: Extrai interface da tarefa para componente TaskCard"`
3. Faça o push para o GitHub e abra o seu **Pull Request** para a revisão!