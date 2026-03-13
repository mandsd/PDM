import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { titulo } from './util';
import titulo_default from './util';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{titulo}</Text>
      <Text>{titulo_default}</Text>
      <StatusBar style="auto" />
      <Button title="Clique aqui"/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
