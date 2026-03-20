import { StyleSheet, ScrollView, Text } from "react-native";


function MetaList(props){
    return(
    <ScrollView>


        {props.array.map((meta, index) =>
            <Text style={styles.item} key={index}>{meta}</Text>
        )}
   
    </ScrollView>
    )
}




const styles = StyleSheet.create({
    item: {
    margin:8,
    borderRadius:5,
    padding:10,
    backgroundColor: "lightblue",
  }
})


export default MetaList;


