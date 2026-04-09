import { Text, FlatList } from 'react-native';
import DespesaItem from './DespesaItem';

function DespesaLista({despesas}){
    return (
        <FlatList
            data={despesas}
            renderItem={DespesaItem}
            keyExtractor={(item) => item.id}
        />
    )
}

export default DespesaLista;