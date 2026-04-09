import { StyleSheet, ScrollView, Pressable, Text, View } from "react-native";

function MetaList(props){
    return(
   
    <ScrollView keyboardShouldPersistTaps="handled"> 

        {props.array.map((meta) => {
            return (
                
                <View key={meta.id} style={styles.itemContainer}> 
                    <Pressable
                        android_ripple={{color: '#ffeb3b'}} 
                        onPress={() => props.onDeleteItem(meta.id)}
                        style={styles.pressableArea} 
                    >
                        <Text>{meta.texto}</Text>
                    </Pressable>
                </View>
            )
        })}
    
    </ScrollView>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
      margin: 8,
      borderRadius: 5,
      overflow: 'hidden', // Super importante: impede que o 'ripple' quadrado vaze do botão arredondado!
    },
    pressableArea: {
      padding: 10,
      backgroundColor: "lightblue",
    }
})

export default MetaList;