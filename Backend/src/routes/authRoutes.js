// Express Router permite modularizar as rotas
// Em vez de tudo no server.js, separamos por contexto
const express = require("express");
const router = express.Router();

// Importa as funções do controller
const { cadastro, login } = require("../controllers/authController");

// Define as rotas de autenticação
// POST /auth/cadastro → chama a função cadastro
router.post("/cadastro", cadastro);

// POST /auth/login → chama a função login
router.post("/login", login);

module.exports = router;