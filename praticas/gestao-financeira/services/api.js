/**
 * URL base da API.
 *
 * - No emulador Android, "localhost" do app aponta para o próprio emulador,
 *   por isso usamos 10.0.2.2 (IP especial que o Android mapeia para o
 *   localhost da máquina hospedeira).
 * - Em device físico, troque para o IP da sua máquina na rede local
 *   (ex.: http://192.168.0.10:3000) — descubra com `ipconfig` no Windows.
 * - Para iOS Simulator, "http://localhost:3000" funciona normalmente.
 *
 * Você pode sobrescrever via variável de ambiente do Expo (EXPO_PUBLIC_API_URL).
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  listCategories:    ()        => request("/categories"),
  createCategory:    (data)    => request("/categories",        { method: "POST",   body: JSON.stringify(data) }),
  updateCategory:    (id, d)   => request(`/categories/${id}`,  { method: "PUT",    body: JSON.stringify(d) }),
  deleteCategory:    (id)      => request(`/categories/${id}`,  { method: "DELETE" }),

  listTransactions:  ()        => request("/transactions"),
  createTransaction: (data)    => request("/transactions",       { method: "POST",   body: JSON.stringify(data) }),
  updateTransaction: (id, d)   => request(`/transactions/${id}`, { method: "PUT",    body: JSON.stringify(d) }),
  deleteTransaction: (id)      => request(`/transactions/${id}`, { method: "DELETE" }),
};
