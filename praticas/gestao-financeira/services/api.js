const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

let _token = null;

export function setAuthToken(token) {
  _token = token;
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  listCategories:    ()        => request("/categories"),
  createCategory:    (data)    => request("/categories",        { method: "POST",   body: JSON.stringify(data) }),
  updateCategory:    (id, d)   => request(`/categories/${id}`,  { method: "PUT",    body: JSON.stringify(d) }),
  deleteCategory:    (id)      => request(`/categories/${id}`,  { method: "DELETE" }),

  listTransactions:  ()        => request("/transactions"),
  createTransaction: (data)    => request("/transactions",       { method: "POST",   body: JSON.stringify(data) }),
  updateTransaction: (id, d)   => request(`/transactions/${id}`, { method: "PUT",    body: JSON.stringify(d) }),
  deleteTransaction: (id)      => request(`/transactions/${id}`, { method: "DELETE" }),
};
