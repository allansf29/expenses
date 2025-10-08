// src/services/api.ts
import axios, { type AxiosInstance } from 'axios'; // Importa o TIPO corretamente

// Cria a instância do axios com a URL base, especificando o tipo
const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // Porta base do backend
});

export default api;