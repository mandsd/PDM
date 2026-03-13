# 💻 Prática 02: Construindo a Interface da Lista de Tarefas

Chegou a hora de dar uma "cara" ao nosso aplicativo! Nesta prática, vamos construir a **Interface Gráfica (UI)** do To-Do List. Ainda não teremos funcionalidades reais (como adicionar ou deletar), o objetivo hoje é apenas desenhar a tela usando os Componentes Core e o StyleSheet.

## 🛠️ O que deve ser feito

1. **Siga o Fluxo:** Crie a Issue da Prática 02 no GitHub, depois crie a branch `feature/pratica02` no seu terminal.
2. Limpe o arquivo `App.js` (ou `App.jsx`) removendo o "Hello World" da aula passada.
3. Construa a seguinte estrutura visual:
   * **Cabeçalho:** Um título grande e em negrito escrito "Minhas Tarefas".
   * **Área de Inserção:** Um `<TextInput>` para digitar a tarefa e, ao lado dele, um botão (`<TouchableOpacity>`) com um ícone de `+` ou o texto "Add". Use Flexbox (`flexDirection: 'row'`) para deixá-los na mesma linha.
   * **Lista de Tarefas (Estática):** Crie 2 ou 3 "cards" de tarefas fixos no código (hardcoded). Cada card deve ter um texto longo e um botão de lixeira (pode ser apenas um texto "X" por enquanto).

## 💡 Dicas de Estilização
Abaixo está um "esqueleto" mental de como seu código deve se parecer. Tente usar essas propriedades no seu `StyleSheet`:

* Use `padding` na `View` principal para desgrudar os elementos das bordas do celular.
* No `TextInput`, use `borderWidth`, `borderColor` e `borderRadius` para criar a caixa de texto.
* Lembre-se: Para colocar o Input e o Botão lado a lado, coloque os dois dentro de uma `<View>` e aplique `flexDirection: 'row'` nessa View!

## ✅ Como Entregar
1. Verifique se o layout ficou agradável no seu celular via Expo Go.
2. Faça o commit: `git commit -m "Feat: Cria interface estatica do app de tarefas"`
3. Faça o push para o GitHub e abra o seu **Pull Request** para correção!