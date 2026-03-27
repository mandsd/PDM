import { StyleSheet, View, TextInput, Button } from "react-native";
import { useState } from 'react';
import { rotulo_btn_cadastro_meta, rotulo_input_meta } from "../mensagens";

function MetaInput(props){
    
    const [inputMetaText, setInputMetaText] = useState("");

    function metaInputHandler(inputText){
    setInputMetaText(inputText)
    };

    function addMetaHandler (){
        props.onAddMeta(inputMetaText);
        setInputMetaText(" ");
    }
    
    return(

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
                onPress={addMetaHandler}
                title={rotulo_btn_cadastro_meta}/>
            </View>

      </View>
    )
}



const styles = StyleSheet.create({
    
  inputText: {
    borderWidth: 1,
    borderColor: '#ccccc',
  },
});

export default MetaInput;