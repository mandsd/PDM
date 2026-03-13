# 📚 Aula 04: Listas Eficientes e Persistência Local

Na última aula, você deve ter notado um problema grave: quando adicionamos muitas tarefas, a tela não rola para baixo! Além disso, se fecharmos o aplicativo, todas as nossas tarefas somem. Hoje, vamos resolver esses dois problemas.

## 🎯 Objetivos da Aula
* Entender por que não devemos usar `.map()` para listas grandes no mobile.
* Aprender a usar o componente `<FlatList>` para rolagem eficiente.
* Compreender o funcionamento do `AsyncStorage` para salvar dados no celular.
* Introdução rápida ao ciclo de vida com `useEffect`.

## 📜 O Problema do `.map()` e a Solução: `FlatList`
Na Web, usamos o `.map()` o tempo todo. No mobile, se você tiver uma lista com 1000 itens, o `.map()` tentará desenhar os 1000 de uma vez, travando o celular do usuário.

A solução do React Native é a **`FlatList`**. Ela é inteligente: só desenha na tela os itens que o usuário está vendo no momento. Conforme ele rola para baixo, ela recicla a memória dos itens que ficaram para cima.

**Como usar a FlatList? Ela exige 3 propriedades (props) obrigatórias:**
1. `data={array}`: Qual é a lista de dados que ela vai renderizar?
2. `keyExtractor={(item) => item.id}`: Como ela identifica cada item de forma única?
3. `renderItem={({ item }) => <Card />}`: Como ela deve desenhar cada item na tela?

## 💾 Persistência de Dados (AsyncStorage)
O estado (`useState`) vive apenas na memória RAM. Fechou o app, a RAM é limpa. Para salvar de verdade no aparelho (como o WhatsApp salva suas conversas offline), usamos o `@react-native-async-storage/async-storage`.

Ele funciona como um "gaveteiro" de chave e valor (Key-Value), mas **só aceita textos (Strings)**.
* Para salvar um Array/Objeto, precisamos transformá-lo em texto usando `JSON.stringify()`.
* Para ler o texto e transformá-lo de volta em Array, usamos `JSON.parse()`.

Como ler e gravar no celular demora alguns milissegundos, essas funções são **Assíncronas** (precisamos usar `async` e `await`).

## ⏱️ O Gancho `useEffect`
Como fazemos para carregar as tarefas salvas exatamente no momento em que o app abre? Usamos o `useEffect`. Ele é um Hook que executa uma função num momento específico do ciclo de vida do componente.

```javascript
useEffect(() => {
  // O que colocar aqui dentro vai rodar assim que a tela abrir!
  carregarTarefas();
}, []); // O array vazio [] significa "rode apenas uma vez, na montagem".
```