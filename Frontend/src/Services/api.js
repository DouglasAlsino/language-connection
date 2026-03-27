// Importa o axios — biblioteca para fazer requisições HTTP
import axios from "axios";


// Cria uma instância configurada do axios
// baseURL aponta para o backend que está rodando em localhost:3000
// Todas as chamadas vão usar esse endereço como base
const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de requisição
// Roda automaticamente ANTES de cada chamada à API
// Verifica se existe um token JWT salvo no localStorage
// e adiciona no header Authorization se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;