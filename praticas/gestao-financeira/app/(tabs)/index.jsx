import { useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { MoneyContext } from "@/contexts/GlobalState";
import { useAuth } from "@/contexts/AuthContext";
import TransactionItem from "@/components/TransactionItem";
import { globalStyles } from "@/styles/globalStyles";
import { colors } from "@/constants/colors";

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

export default function Transactions() {
  const { transactions, categories, loading, error, refresh, removeTransaction, updateTransaction } =
    useContext(MoneyContext);
  const { user } = useAuth();

  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear,  setFilterYear]  = useState(now.getFullYear());

  const [editItem,     setEditItem]     = useState(null);
  const [editForm,     setEditForm]     = useState({});
  const [showDatePick, setShowDatePick] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  const filtered = useMemo(() =>
    transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
    }),
    [transactions, filterMonth, filterYear]
  );

  const shiftMonth = (delta) => {
    let m = filterMonth + delta;
    let y = filterYear;
    if (m < 0)  { m = 11; y -= 1; }
    if (m > 11) { m = 0;  y += 1; }
    setFilterMonth(m);
    setFilterYear(y);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({
      description: item.description,
      value: Number(item.value),
      date: new Date(item.date),
      categoryId: item.categoryId,
    });
  };

  const handleLongPress = (item) => {
    Alert.alert(
      item.description,
      "O que deseja fazer?",
      [
        { text: "Editar",  onPress: () => openEdit(item) },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () =>
            Alert.alert("Excluir transação", `Excluir "${item.description}"?`, [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Excluir",
                style: "destructive",
                onPress: async () => {
                  try { await removeTransaction(item.id); }
                  catch (e) { Alert.alert("Erro", e.message); }
                },
              },
            ]),
        },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  const handleSaveEdit = async () => {
    if (!editForm.description?.trim()) { Alert.alert("Informe a descrição."); return; }
    if (!editForm.value || editForm.value <= 0) { Alert.alert("Informe um valor válido."); return; }
    setSubmitting(true);
    try {
      await updateTransaction(editItem.id, {
        description: editForm.description.trim(),
        value: editForm.value,
        date: editForm.date,
        categoryId: editForm.categoryId,
      });
      setEditItem(null);
    } catch (e) {
      Alert.alert("Erro ao salvar", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.secondaryText}>Carregando transações...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <Text style={globalStyles.primaryText}>Não foi possível carregar.</Text>
        <Text style={globalStyles.secondaryText}>{error}</Text>
        <TouchableOpacity onPress={refresh} style={styles.retry}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={globalStyles.screenContainer}>
      {/* boas-vindas */}
      {user && (
        <View style={styles.welcome}>
          <Text style={styles.welcomeText}>Olá, {user.name}! 👋</Text>
        </View>
      )}

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

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => handleLongPress(item)} activeOpacity={0.7}>
            <TransactionItem {...item} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={globalStyles.secondaryText}>
            Nenhuma transação em {MONTHS[filterMonth]}/{filterYear}.
          </Text>
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        contentContainerStyle={styles.listContent}
      />

      {/* modal de edição */}
      <Modal visible={!!editItem} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar transação</Text>

            <Text style={globalStyles.inputLabel}>Descrição</Text>
            <TextInput
              style={globalStyles.input}
              value={editForm.description}
              onChangeText={(v) => setEditForm((p) => ({ ...p, description: v }))}
            />

            <Text style={[globalStyles.inputLabel, { marginTop: 10 }]}>Valor (R$)</Text>
            <TextInput
              style={globalStyles.input}
              keyboardType="numeric"
              value={editForm.value ? String(editForm.value) : ""}
              onChangeText={(v) => {
                const n = parseFloat(v.replace(",", "."));
                setEditForm((p) => ({ ...p, value: isNaN(n) ? 0 : n }));
              }}
            />

            <Text style={[globalStyles.inputLabel, { marginTop: 10 }]}>Data</Text>
            <TouchableOpacity onPress={() => setShowDatePick(true)}>
              <TextInput
                style={globalStyles.input}
                editable={false}
                value={editForm.date instanceof Date
                  ? editForm.date.toLocaleDateString("pt-BR")
                  : new Date(editForm.date ?? Date.now()).toLocaleDateString("pt-BR")}
              />
            </TouchableOpacity>
            {showDatePick && (
              <RNDateTimePicker
                mode="date"
                value={editForm.date instanceof Date ? editForm.date : new Date(editForm.date ?? Date.now())}
                onChange={(_, d) => {
                  setShowDatePick(false);
                  if (d) setEditForm((p) => ({ ...p, date: d }));
                }}
              />
            )}

            <Text style={[globalStyles.inputLabel, { marginTop: 10 }]}>Categoria</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={editForm.categoryId}
                onValueChange={(v) => setEditForm((p) => ({ ...p, categoryId: v }))}
              >
                {categories.map((c) => (
                  <Picker.Item key={c.id} label={c.displayName} value={c.id} />
                ))}
              </Picker>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setEditItem(null)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSaveEdit}
                disabled={submitting}
              >
                <Text style={styles.saveText}>{submitting ? "Salvando..." : "Salvar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingVertical: 12, paddingHorizontal: 20, gap: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  retry: {
    marginTop: 12, paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: colors.primary, borderRadius: 8,
  },
  retryText: { color: colors.primaryContrast, fontWeight: "600" },
  welcome: {
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4,
  },
  welcomeText: { fontSize: 15, fontWeight: "700", color: colors.primary },
  filter: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 16, paddingVertical: 8,
  },
  filterLabel: { fontSize: 15, fontWeight: "600", color: colors.primaryText, minWidth: 140, textAlign: "center" },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 36,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: colors.primaryText, marginBottom: 14 },
  picker: {
    height: 44, borderWidth: 1, borderColor: colors.secondaryText,
    borderRadius: 8, justifyContent: "center",
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 18 },
  modalBtn: { flex: 1, height: 44, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cancelBtn: { borderWidth: 1, borderColor: colors.secondaryText },
  saveBtn:   { backgroundColor: colors.primary },
  cancelText: { color: colors.primaryText, fontWeight: "600" },
  saveText:   { color: colors.primaryContrast, fontWeight: "600" },
});
