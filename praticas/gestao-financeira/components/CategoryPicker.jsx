import { Picker } from "@react-native-picker/picker";
import { StyleSheet, Text, View } from "react-native";
import { globalStyles } from "@/styles/globalStyles";
import { colors } from "@/constants/colors";

/**
 * Picker de categoria que itera dinamicamente sobre a lista vinda do back-end.
 *
 * @param {{
 *   form: { categoryId: string },
 *   setForm: (next: object) => void,
 *   categories: Array<{ id: string, displayName: string }>
 * }} props
 * @returns {JSX.Element}
 */
export default function CategoryPicker({ form, setForm, categories }) {
  return (
    <View>
      <Text style={globalStyles.inputLabel}>Categoria</Text>
      <View style={styles.picker}>
        <Picker
          selectedValue={form.categoryId}
          onValueChange={(itemValue) =>
            setForm({ ...form, categoryId: itemValue })
          }
        >
          {categories.map((c) => (
            <Picker.Item key={c.id} label={c.displayName} value={c.id} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    display: "flex",
    justifyContent: "center",
    height: 44,
    borderColor: colors.secondaryText,
    borderWidth: 1,
    borderRadius: 8,
    flexGrow: 1,
  },
});