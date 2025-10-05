import api from "./api";

// Buscar todos os lançamentos
export const getExpenses = async () => {
  const res = await api.get("/expenses");
  return res.data;
};

// Criar novo lançamento
export const createExpense = async (data) => {
  const res = await api.post("/expenses", data);
  return res.data;
};

// Atualizar lançamento existente
export const updateExpense = async (id, data) => {
  const res = await api.put(`/expenses/${id}`, data);
  return res.data;
};

// Deletar lançamento
export const deleteExpense = async (id) => {
  await api.delete(`/expenses/${id}`);
};
