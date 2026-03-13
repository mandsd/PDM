# 📚 Aula 05: Arquitetura, Componentização e Props

Neste ponto do campeonato, nosso arquivo `App.js` deve estar enorme. Temos funções de armazenamento, lógica de estado e várias tags de interface misturadas. Hoje, vamos aprender a pensar como engenheiros de software e organizar nosso projeto em "blocos de montar" (Lego).

## 🎯 Objetivos da Aula
* Entender o conceito de **Componentização**.
* Aprender a estruturar pastas em um projeto real (`src/components`).
* Dominar o uso de **Props** (Propriedades) para passar dados de um arquivo para outro.

## 🧱 O que é Componentização?
No React, um Componente é basicamente uma função JavaScript que retorna uma interface (UI). Em vez de termos um arquivo gigante com 500 linhas de código, nós quebramos a interface em pedaços menores, reutilizáveis e independentes.

* **Exemplo:** Em vez de desenhar a caixa de texto e o botão de "+" direto no `App.js`, criamos um arquivo separado chamado `InputTarefa.js`.
* **Vantagem:** Se houver um bug no botão de adicionar, você sabe exatamente em qual arquivo procurar, sem correr o risco de quebrar a lista de tarefas.

## 🤝 Props (Propriedades): A Comunicação entre Arquivos
Quando quebramos o app em vários arquivos, surge um problema: o Estado (`tasks`) está no `App.js`, mas o botão de deletar agora está dentro do arquivo `CardTarefa.js`. Como um fala com o outro? Através das **Props**.

As Props são como "parâmetros de função" no mundo do React. Elas permitem que o Componente Pai (`App.js`) envie dados ou funções para o Componente Filho (`CardTarefa.js`).

**Exemplo no Componente Pai (`App.js`):**
```javascript
// Enviando o texto da tarefa e a função de deletar como Props
<CardTarefa titulo="Estudar React" aoDeletar={funcaoDeletar} />
```
**Exemplo no Componente Filho (`CardTarefa.js`):**
```javascript
// Recebendo as Props (usamos desestruturação {})
export function CardTarefa({ titulo, aoDeletar }) {
  return (
    <View>
      <Text>{titulo}</Text>
      <TouchableOpacity onPress={aoDeletar}>
         <Text>X</Text>
      </TouchableOpacity>
    </View>
  );
}
```
📂 **Estrutura de Pastas Padrão**
No mercado, não deixamos os arquivos soltos na raiz. Criamos uma pasta src/ (Source) e organizamos por responsabilidade:
- src/components/: Pedaços de tela (Botões, Cards, Inputs).
- src/screens/: Telas inteiras (Tela Home, Tela de Login).
- src/services/: Conexões com banco de dados ou APIs.