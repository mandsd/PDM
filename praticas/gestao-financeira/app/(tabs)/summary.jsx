import { useContext, useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MoneyContext } from "@/contexts/GlobalState";
import SummaryItem from "@/components/SummaryItem";
import { globalStyles } from "@/styles/globalStyles";
import { colors } from "@/constants/colors";

/**
 * Tela "Resumo".
 *
 * Itera sobre as categorias vindas do servidor (não há mais lista hardcoded)
 * e calcula:
 *  - totais por categoria (somatório dos `value` das transações da categoria);
 *  - saldo final = soma das transações de categorias `isIncome` menos as demais.
 *
 * @returns {JSX.Element}
 */
export default function Summary() {
  const { transactions, categories, loading } = useContext(MoneyContext);

  const { totalsById, balance } = useMemo(() => {
    const acc = {};
    let saldo = 0;

    for (const c of categories) acc[c.id] = 0;

    for (const t of transactions) {
      const numericValue = Number(t.value);
      if (acc[t.categoryId] !== undefined) {
        acc[t.categoryId] += numericValue;
      }
      const cat = t.category ?? categories.find((c) => c.id === t.categoryId);
      if (cat?.isIncome) {
        saldo += numericValue;
      } else {
        saldo -= numericValue;
      }
    }
    return { totalsById: acc, balance: saldo };
  }, [transactions, categories]);

  if (loading && categories.length === 0) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const balanceStyle =
    balance >= 0 ? globalStyles.positiveText : globalStyles.negativeText;

  return (
    <View style={globalStyles.screenContainer}>
      <ScrollView style={globalStyles.content}>
        {categories.map((category) => (
          <SummaryItem
            key={category.id}
            category={category}
            value={totalsById[category.id] ?? 0}
          />
        ))}
        <View style={globalStyles.line} />
        <View style={styles.balance}>
          <Text style={styles.balanceText}>Saldo</Text>
          <Text style={balanceStyle}>
            {balance.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  balance: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceText: {
    fontSize: 18,
    color: colors.primaryText,
    fontWeight: "800",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});