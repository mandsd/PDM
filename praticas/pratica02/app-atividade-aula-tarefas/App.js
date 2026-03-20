import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Button, ScrollView } from 'react-native';
import {
  rotulo_btn_cadastro_meta,
  rotulo_input_meta, rotulo_lista_metas
} from './mensagens';


import { useState } from 'react';
import MetaList from './components/MetaList';

export default function App() {
  const [inputMetaText, setInputMetaText] = useState("");
  const [metas, setMetas] = useState([]);


  function metaInputHandler(inputText){
    setInputMetaText(inputText)
  };


  function adicionarMetaHandler(){
    setMetas([...metas, inputMetaText])
  };


 
  return (
    <View style={styles.mainContainer}>


      <View style = {{flexDirection: 'row', justifyContent:'space-between'}}>


        <View style={{width: '65%' }} >
          <TextInput
          onChangeText={metaInputHandler}
          style = {styles.inputText}
          placeholder={rotulo_input_meta}
          />
        </View>
     
        <View style={{width: '30%' }} >
          <Button
          onPress={adicionarMetaHandler}
          title={rotulo_btn_cadastro_meta}/>
        </View>


      </View>


      <View styles={styles.metaContainer}>
        <MetaList array={metas} />
      </View>


    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer:{
    padding : 30,
    Flex: 1,
    flexDirection: 'column',
  },
 
  inputText: {
    borderWidth: 1,
    borderColor: '#ccccc',
  },
  metaContainer:{
    flex:15
  }
});
