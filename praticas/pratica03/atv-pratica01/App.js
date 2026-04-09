import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import GerenciarDespesa from './screens/GerenciarDespesa';
import DespesasRecentes from './screens/DespesasRecentes';
import TodasDespesas from './screens/TodasDespesas';
import IconButton from './components/despesa/IconButton';

export default function App() {

    const Tab = createBottomTabNavigator();
    const Stack = createNativeStackNavigator();

    function BottonTabScreen(){
        const navigation = require('@react-navigation/native').useNavigation();
        return (
            <Tab.Navigator
                screenOptions={({ navigation }) => ({
                    headerRight: () => (
                        <IconButton
                            icon="add"
                            size={24}
                            onPress={() => navigation.navigate('GerenciarDespesa')}
                        />
                    )
                })}
            >
                <Tab.Screen
                    name="DespesasRecentes"
                    component={DespesasRecentes}
                    options={{
                        tabBarIcon: ({color, size}) => (<Ionicons name="hourglass" size={size} color={color} />),
                        tabBarLabel: 'Recentes',
                        title: 'Despesas Recentes',
                        tabBarLabelStyle: { fontSize: 12 }
                    }}
                />
                <Tab.Screen
                    name="TodasDespesas"
                    component={TodasDespesas}
                    options={{
                        tabBarIcon: ({color, size}) => (<Ionicons name="wallet-outline" size={size} color={color} />),
                        tabBarLabel: 'Todas',
                        title: 'Todas as Despesas',
                        tabBarLabelStyle: { fontSize: 12 }
                    }}
                />
            </Tab.Navigator>
        )
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Despesas"
                    component={BottonTabScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="GerenciarDespesa"
                    component={GerenciarDespesa}
                />
            </Stack.Navigator>
        </NavigationContainer>
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