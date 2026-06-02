import { useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";
import { MaterialIcons } from "@expo/vector-icons";
import { MoneyContext } from "@/contexts/GlobalState";
import SummaryItem from "@/components/SummaryItem";
import { globalStyles } from "@/styles/globalStyles";
import { colors } from "@/constants/colors";

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

function polarToCartesian(cx, cy, r, angle) {
  return {
    x: cx + r * Math.cos(angle - Math.PI / 2),
    y: cy + r * Math.sin(angle - Math.PI / 2),
  };
}

function slicePath(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

function PieChart({ slices, size = 220 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size / 2 - 8;

  let angle = 0;
  const paths = slices.map((s) => {
    const sweep = (s.pct / 100) * 2 * Math.PI;
    const path = { ...s, path: slicePath(cx, cy, r, angle, angle + sweep) };
    angle += sweep;
    return path;
  });

  // label no centro
  const total = slices.reduce((a, s) => a + s.value, 0);

  return (
    <Svg width={size} height={size}>
      <G>
        {paths.map((s, i) => (
          <Path key={i} d={s.path} fill={s.color} stroke={colors.background} strokeWidth={1} />
        ))}
      </G>
      <SvgText
        x={cx} y={cy - 6}
        textAnchor="middle" fill={colors.primaryText}
        fontSize={13} fontWeight="700"
      >
        Total
      </SvgText>
      <SvgText
        x={cx} y={cy + 14}
        textAnchor="middle" fill={colors.primaryText}
        fontSize={12}
      >
        {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </SvgText>
    </Svg>
  );
}

export default function Summary() {
  const { transactions, categories, loading } = useContext(MoneyContext);

  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear,  setFilterYear]  = useState(now.getFullYear());

  const shiftMonth = (delta) => {
    let m = filterMonth + delta;
    let y = filterYear;
    if (m < 0)  { m = 11; y -= 1; }
    if (m > 11) { m = 0;  y += 1; }
    setFilterMonth(m);
    setFilterYear(y);
  };

  const filtered = useMemo(() =>
    transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
    }),
    [transactions, filterMonth, filterYear]
  );

  const { totalsById, balance } = useMemo(() => {
    const acc = {};
    let saldo = 0;
    for (const c of categories) acc[c.id] = 0;
    for (const t of filtered) {
      const v = Number(t.value);
      if (acc[t.categoryId] !== undefined) acc[t.categoryId] += v;
      const cat = t.category ?? categories.find((c) => c.id === t.categoryId);
      if (cat?.isIncome) saldo += v; else saldo -= v;
    }
    return { totalsById: acc, balance: saldo };
  }, [filtered, categories]);

  const pieSlices = useMemo(() => {
    const expenses = categories
      .filter((c) => !c.isIncome && totalsById[c.id] > 0)
      .map((c) => ({ label: c.displayName, value: totalsById[c.id], color: c.background }));
    const total = expenses.reduce((s, e) => s + e.value, 0);
    return expenses.map((e) => ({ ...e, pct: total > 0 ? (e.value / total) * 100 : 0 }));
  }, [categories, totalsById]);

  if (loading && categories.length === 0) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const balanceStyle = balance >= 0 ? globalStyles.positiveText : globalStyles.negativeText;

  return (
    <View style={globalStyles.screenContainer}>
      {/* filtro mês/ano */}
      <View style={styles.filter}>
        <TouchableOpacity onPress={() => shiftMonth(-1)} hitSlop={10}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.filterLabel}>
          {MONTHS[filterMonth]} {filterYear}
        </Text>
        <TouchableOpacity onPress={() => shiftMonth(1)} hitSlop={10}>
          <MaterialIcons name="chevron-right" size={28} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

      <ScrollView style={globalStyles.content}>
        {/* gráfico de pizza */}
        {pieSlices.length > 0 ? (
          <View style={styles.chartContainer}>
            <PieChart slices={pieSlices} />
            {/* legenda */}
            <View style={styles.legend}>
              {pieSlices.map((s, i) => (
                <View key={i} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                  <Text style={styles.legendLabel}>{s.label}</Text>
                  <Text style={styles.legendPct}>{s.pct.toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text style={[globalStyles.secondaryText, { textAlign: "center", marginVertical: 12 }]}>
            Sem despesas em {MONTHS[filterMonth]}/{filterYear}.
          </Text>
        )}

        <View style={globalStyles.line} />

        {/* totais por categoria */}
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
            {balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filter: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 16, paddingVertical: 8,
  },
  filterLabel: {
    fontSize: 15, fontWeight: "600", color: colors.primaryText,
    minWidth: 140, textAlign: "center",
  },
  chartContainer: { alignItems: "center", marginVertical: 12, gap: 12 },
  legend: { gap: 6, width: "100%" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { flex: 1, fontSize: 13, color: colors.primaryText },
  legendPct: { fontSize: 13, color: colors.secondaryText },
  balance: { flexDirection: "row", justifyContent: "space-between" },
  balanceText: { fontSize: 18, color: colors.primaryText, fontWeight: "800" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
