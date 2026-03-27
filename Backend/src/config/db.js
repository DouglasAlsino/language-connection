// Importa o mysql2 com suporte a Promises
// Isso permite usar async/await nas queries em vez de callbacks
const mysql = require("mysql2/promise");

// Importa o dotenv para ler as variáveis do arquivo .env
require("dotenv").config();

// Cria um pool de conexões com o banco
// Pool é mais eficiente que uma conexão única:
// reutiliza conexões existentes em vez de abrir uma nova a cada query
const pool = mysql.createPool({
  host: process.env.DB_HOST,         // localhost
  user: process.env.DB_USER,         // root
  password: process.env.DB_PASSWORD, // sua senha
  database: process.env.DB_NAME,     // language_connection
  waitForConnections: true,
  connectionLimit: 10,               // máximo de conexões simultâneas
  queueLimit: 0,
});

module.exports = pool;