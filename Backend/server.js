// Carrega as variáveis do .env antes de qualquer coisa
require("dotenv").config();

const express = require("express");

// cors permite que o frontend em localhost:5173 acesse
// o backend em localhost:3000 sem erro de CORS
const cors = require("cors");

const app = express();

// ─── Middlewares globais ───────────────────────────────

// Habilita CORS para todas as origens
// Em produção, trocar para: cors({ origin: "https://seusite.com" })
app.use(cors());

// Permite receber JSON no body das requisições
// Sem isso, req.body fica undefined
app.use(express.json());

// ─── Rotas ────────────────────────────────────────────

// Importa e registra as rotas de autenticação
// Todas as rotas do arquivo authRoutes.js vão ter prefixo /auth
// ex: POST /auth/login, POST /auth/cadastro
const authRoutes = require("./src/routes/authRoutes");
app.use("/auth", authRoutes);

// Importa e registra as rotas de usuários
// Todas as rotas do arquivo usuarioRoutes.js vão ter prefixo /usuarios
// ex: GET /usuarios
const usuariosRoutes = require("./src/routes/usuariosRoutes");
app.use("/usuarios", usuariosRoutes);

// Rota de teste para verificar se o servidor está rodando
// Acesse http://localhost:3000/health no navegador
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mensagem: "Backend Language Connection rodando!",
  });
});

// ─── Inicializa o servidor ─────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📦 Banco: ${process.env.DB_NAME}`);
});