# 📚 Aula 02: Fundamentos de Interface no React Native

Nesta aula, deixamos a web de lado (adeus HTML e CSS tradicional) e mergulhamos na forma nativa de construir interfaces. Vamos entender como o React Native traduz o nosso código JavaScript para elementos visuais reais no Android e no iOS.

## 🎯 Objetivos da Aula
* Compreender o mapeamento de tags Web (HTML) para Componentes Core do React Native.
* Entender o funcionamento do `StyleSheet`.
* Dominar o básico do **Flexbox** voltado para o ambiente mobile.

## 🧱 Componentes Core (O "HTML" do Mobile)
No React Native, não usamos `<div>`, `<h1>` ou `<input>`. Precisamos importar componentes específicos do pacote `react-native`:

| Web (ReactJS) | Mobile (React Native) | Para que serve? |
| :--- | :--- | :--- |
| `<div>` | `<View>` | Container principal para agrupar outros elementos. |
| `<p>`, `<h1>`, `<span>` | `<Text>` | Qualquer texto **precisa** estar dentro desta tag. |
| `<input type="text">` | `<TextInput>` | Campo para o usuário digitar. |
| `<button>` | `<TouchableOpacity>` | Botão customizável que pisca (muda opacidade) ao toque. |

## 🎨 Estilização (O "CSS" do Mobile)
Não temos arquivos `.css`. Toda a estilização é feita via JavaScript usando o `StyleSheet.create({})`. 
* As propriedades são escritas em `camelCase` (ex: `backgroundColor` em vez de `background-color`).
* Não usamos `px` (pixels). Os valores numéricos são unidades independentes de densidade. Ex: `fontSize: 16`.

## 📦 Flexbox no React Native
O Flexbox é a única forma de criar layouts no React Native. Ele funciona quase igual à web, mas com **uma diferença crucial**:
* Na Web, o padrão do Flexbox é colocar os itens em linha (`flexDirection: 'row'`).
* No Mobile, o padrão é colocar os itens em coluna (`flexDirection: 'column'`), um embaixo do outro, respeitando o formato da tela do celular.



**Propriedades mais usadas:**
* `justifyContent`: Alinha os itens no eixo principal (vertical por padrão).
* `alignItems`: Alinha os itens no eixo secundário (horizontal por padrão).