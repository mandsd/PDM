import { StyleSheet, Text, TouchableHighlight } from "react-native";
import { colors } from "@/constants/colors";

/**
 * Botão primário do app.
 *
 * @param {{ children: React.ReactNode, onPress: () => void, disabled?: boolean }} props
 * @returns {JSX.Element}
 */
export default function Button({ children, onPress, disabled = false }) {
  return (
    <TouchableHighlight
      style={[style.background, disabled && style.disabled]}
      onPress={disabled ? undefined : onPress}
      underlayColor={colors.primary}
    >
      <Text style={style.text}>{children}</Text>
    </TouchableHighlight>
  );
}

const style = StyleSheet.create({
  background: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.primaryContrast,
    fontSize: 18,
    fontWeight: "600",
  },
});