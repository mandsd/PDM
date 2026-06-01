import { StyleSheet, Text, View } from "react-native";
import { globalStyles } from "@/styles/globalStyles";
import CategoryItem from "@/components/CategoryItem";

/**
 * Item de uma transação na lista (tela "Transações").
 *
 * Recebe a transação inteira (já com a categoria expandida pelo back-end)
 * e formata data/valor em português brasileiro.
 *
 * @param {{ category: object, date: string|Date, description: string, value: string|number }} props
 * @returns {JSX.Element}
 */
export default function TransactionItem({ category, date, description, value }) {
  const numericValue = Number(value);
  const valueStyle = category?.isIncome
    ? globalStyles.positiveText
    : globalStyles.negativeText;

  return (
    <>
      <View style={styles.itemContainer}>
        <CategoryItem category={category} />
        <View style={styles.textContainer}>
          <Text style={globalStyles.secondaryText}>
            {new Date(date).toLocaleDateString("pt-BR")}
          </Text>
          <View style={styles.bottomLineContainer}>
            <Text style={globalStyles.primaryText}>{description}</Text>
            <Text style={valueStyle}>
              {numericValue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </Text>
          </View>
        </View>
      </View>
      <View style={globalStyles.line} />
    </>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 4,
  },
  textContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    marginLeft: 12,
    paddingVertical: 8,
  },
  bottomLineContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});