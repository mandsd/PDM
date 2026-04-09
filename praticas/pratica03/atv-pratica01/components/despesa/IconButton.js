import { Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function IconButton({ icon, size, color, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={({pressed}) => pressed && styles.pressed}
        >
            <View style={styles.button_container}>
                <Ionicons name={icon} size={size} color={color} />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button_container: {
        padding: 10,
    },
    pressed: {
        opacity: 0.5,
    }
});

export default IconButton;