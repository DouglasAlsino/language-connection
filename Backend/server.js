require("dotenv").config();

const express = require("express");
const cors = require("cors");


const http = require("http");


const { Server } = require("socket.io");

const app = express();


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
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

const iaRoutes = require("./src/routes/iaRoutes");
app.use("/ia", iaRoutes); 

const atividadesRoutes = require("./src/routes/atividades");
app.use("/atividades", atividadesRoutes);

// ROTA ADM
const adminRoutes = require("./src/routes/admin");
app.use("/admin", adminRoutes);


io.on("connection", (socket) => {
  console.log(`🔌 Usuário conectado: ${socket.id}`);


  socket.on("entrar_sala", (usuarioId) => {
    socket.join(`usuario_${usuarioId}`);
    console.log(` Usuário ${usuarioId} entrou na sala usuario_${usuarioId}`);
  });

  // Evento disparado quando alguém envia uma mensagem
  socket.on("enviar_mensagem", async (dados) => {
    const { remetente_id, destinatario_id, texto } = dados;

    try {
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


    io.to(`usuario_${destinatario_id}`).emit("nova_mensagem", mensagem);


    socket.emit("nova_mensagem", mensagem);

    } catch (error) {
      console.error("Erro ao salvar mensagem:", error);
    }
  });


  socket.on("disconnect", () => {
    console.log(` Usuário desconectado: ${socket.id}`);
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(` Servidor rodando em http://localhost:${PORT}`);
  console.log(` Banco: ${process.env.DB_NAME}`);
});
