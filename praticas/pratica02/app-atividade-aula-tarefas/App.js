
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import MetaList from './components/MetaList';
import MetaInput from './components/MetaInput';

export default function App() {
  
  const [metas, setMetas] = useState([]);

  function adicionarMetaHandler(inputMeta){
    const novaMeta = {id: Math.random().toString(), texto: inputMeta};
    setMetas([...metas, novaMeta]);
  };

  function deletarMetaHandler(id){
    console.log(id);
    const novasMetas = metas.filter(meta => meta.id  !== id );
    setMetas(novasMetas);
  }

  
  return (
    <View style={styles.mainContainer}>

      <MetaInput onAddMeta={adicionarMetaHandler} />
     

      <View styles={styles.metaContainer}>
        <MetaList array={metas} 
          onDeleteItem = {deletarMetaHandler} 
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer:{
    padding : 30,
    Flex: 1,
    flexDirection: 'column',
  },

  metaContainer:{
    flex:15
  }
});