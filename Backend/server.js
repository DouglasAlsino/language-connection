require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Importa o módulo HTTP nativo do Node para criar o servidor
// O Socket.IO precisa dele para funcionar junto com o Express
const http = require("http");

// Importa o Socket.IO e desestrutura o Server
const { Server } = require("socket.io");

const app = express();

// Cria o servidor HTTP usando o app do Express
// É aqui que Socket.IO vai se acoplar
const server = http.createServer(app);

// Inicializa o Socket.IO no servidor HTTP
// cors aqui é separado do cors do Express — é necessário configurar os dois
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // endereço do frontend Vite
    methods: ["GET", "POST"],
  },
});

// ─── Middlewares globais ───────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Rotas HTTP ───────────────────────────────────────
const authRoutes = require("./src/routes/authRoutes");
app.use("/auth", authRoutes);

const usuariosRoutes = require("./src/routes/usuariosRoutes");
app.use("/usuarios", usuariosRoutes);

const conexoesRoutes = require("./src/routes/conexoesRoutes");
app.use("/conexoes", conexoesRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", mensagem: "Backend Language Connection rodando!" });
});

const mensagensRoutes = require("./src/routes/mensagensRoutes");
app.use("/mensagens", mensagensRoutes);

const postsRoutes = require("./src/routes/postsRoutes");
app.use("/posts", postsRoutes); 

const iaRoutes = require("./src/routes/iaRoutes"); // Importa as rotas de IA
app.use("/ia", iaRoutes); // Usa as rotas de IA com o prefixo /ia

const atividadesRoutes = require("./src/routes/atividades");
app.use("/atividades", atividadesRoutes);

// ROTA ADM
const adminRoutes = require("./src/routes/admin");
app.use("/admin", adminRoutes);

// ─── Socket.IO ────────────────────────────────────────
// io.on("connection") é disparado toda vez que um cliente conecta
// o objeto "socket" representa a conexão individual daquele cliente
io.on("connection", (socket) => {
  console.log(`🔌 Usuário conectado: ${socket.id}`);

  // O cliente entra em uma "sala" privada usando o próprio ID do usuário
  // Salas são canais isolados — mensagens numa sala não vazam para outra
  socket.on("entrar_sala", (usuarioId) => {
    socket.join(`usuario_${usuarioId}`);
    console.log(`👤 Usuário ${usuarioId} entrou na sala usuario_${usuarioId}`);
  });

  // Evento disparado quando alguém envia uma mensagem
  socket.on("enviar_mensagem", async (dados) => {
    const { remetente_id, destinatario_id, texto } = dados;

    try {
      // Salva a mensagem no banco de dados
      const db = require("./src/config/db");
      const [result] = await db.query(
        "INSERT INTO mensagens (remetente_id, destinatario_id, texto) VALUES (?, ?, ?)",
        [remetente_id, destinatario_id, texto]
      );

      const mensagem = {
        id: result.insertId,
        remetente_id,
        destinatario_id,
        texto,
        criado_em: new Date(),
      };

      // Envia para o destinatário na sala dele
    io.to(`usuario_${destinatario_id}`).emit("nova_mensagem", mensagem);

    // Envia de volta APENAS para o socket do remetente, não para toda a sala
    // socket.emit envia só para quem disparou o evento, evitando duplicata
    socket.emit("nova_mensagem", mensagem);

    } catch (error) {
      console.error("Erro ao salvar mensagem:", error);
    }
  });

  // Disparado quando o cliente fecha o navegador ou perde conexão
  socket.on("disconnect", () => {
    console.log(`❌ Usuário desconectado: ${socket.id}`);
  });
});

// ─── Inicializa o servidor ─────────────────────────────
// Importante: usa "server.listen" e não "app.listen"
// porque o Socket.IO está acoplado ao "server", não ao "app"
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📦 Banco: ${process.env.DB_NAME}`);
});