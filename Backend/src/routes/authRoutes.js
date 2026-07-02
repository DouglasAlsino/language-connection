
const express = require("express");
const router = express.Router();

// Importa as funções do controller
const { cadastro, login } = require("../controllers/authController");


router.post("/cadastro", cadastro);

router.post("/login", login);

module.exports = router;
