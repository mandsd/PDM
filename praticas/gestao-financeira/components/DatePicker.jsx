import { Platform, Text, TextInput, TouchableOpacity, View } from "react-native"
import { globalStyles } from "@/styles/globalStyles"
import { useState } from "react"
import RNDateTimePicker from "@react-native-community/datetimepicker"

export default function DatePicker({ form, setForm }) {
  const [showPicker, setShowPicker] = useState(false)

  const handleDateChange = (_, selectDate) => {
    setShowPicker(false)

    if (selectDate) {
      setForm({ ...form, date: selectDate })
    }
  }

  return (
    <View>
      <Text style={globalStyles.inputLabel}>Data</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <TextInput
          value={form.date.toLocaleDateString("pt-BR")}
          onChangeText={(text) => setForm({ ...form, date: text })}
          style={globalStyles.input}
          editable={false}
        />
      </TouchableOpacity>

      {showPicker && (
        <RNDateTimePicker
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          value={form.date}
          onChange={handleDateChange}
        />
      )}
    </View>
  )
}