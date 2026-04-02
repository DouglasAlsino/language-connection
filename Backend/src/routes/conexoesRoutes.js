const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/auth");

// Envia uma solicitação de conexão
router.post("/", authMiddleware, async (req, res) => {
  try {
    const solicitante_id = req.usuario.id;
    const { receptor_id } = req.body;

    if (solicitante_id === receptor_id) {
      return res.status(400).json({ mensagem: "Você não pode se conectar consigo mesmo." });
    }

    await db.query(
      "INSERT INTO conexoes (solicitante_id, receptor_id) VALUES (?, ?)",
      [solicitante_id, receptor_id]
    );

    res.status(201).json({ mensagem: "Solicitação enviada com sucesso!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensagem: "Solicitação já enviada." });
    }
    console.error("Erro ao enviar solicitação:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

// Verifica o status da conexão entre o usuário logado e outro usuário
router.get("/status/:outroUsuarioId", authMiddleware, async (req, res) => {
  try {
    const meuId = req.usuario.id;
    const outroId = req.params.outroUsuarioId;

    const [rows] = await db.query(
      `SELECT status, solicitante_id FROM conexoes
       WHERE (solicitante_id = ? AND receptor_id = ?)
          OR (solicitante_id = ? AND receptor_id = ?)`,
      [meuId, outroId, outroId, meuId]
    );

    if (rows.length === 0) {
      return res.json({ status: "nenhuma" });
    }

    res.json({ status: rows[0].status, solicitante_id: rows[0].solicitante_id });
  } catch (error) {
    console.error("Erro ao verificar status:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

// Aceita ou recusa uma solicitação de conexão
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const meuId = req.usuario.id;
    const { status } = req.body; // "aceita" ou "recusada"
    const conexaoId = req.params.id;

    if (!["aceita", "recusada"].includes(status)) {
      return res.status(400).json({ mensagem: "Status inválido." });
    }

    const [result] = await db.query(
      "UPDATE conexoes SET status = ? WHERE id = ? AND receptor_id = ?",
      [status, conexaoId, meuId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ mensagem: "Ação não permitida." });
    }

    res.json({ mensagem: `Conexão ${status} com sucesso!` });
  } catch (error) {
    console.error("Erro ao atualizar conexão:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

// Lista as solicitações de conexão pendentes recebidas pelo usuário logado
router.get("/pendentes", authMiddleware, async (req, res) => {
  try {
    const meuId = req.usuario.id;

    const [rows] = await db.query(
      `SELECT c.id, c.solicitante_id, c.criado_em,
              u.nome, u.sobrenome, u.idioma_nativo, u.idiomas_aprender
       FROM conexoes c
       JOIN usuarios u ON u.id = c.solicitante_id
       WHERE c.receptor_id = ? AND c.status = 'pendente'
       ORDER BY c.criado_em DESC`,
      [meuId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar pendentes:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

// Lista as conexões aceitas de um usuário pelo id
router.get("/aceitas/:usuarioId", authMiddleware, async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const [rows] = await db.query(
      `SELECT 
        u.id, u.nome, u.sobrenome, u.idioma_nativo, u.idiomas_aprender, u.nivel
       FROM conexoes c
       JOIN usuarios u ON (
         CASE 
           WHEN c.solicitante_id = ? THEN u.id = c.receptor_id
           ELSE u.id = c.solicitante_id
         END
       )
       WHERE (c.solicitante_id = ? OR c.receptor_id = ?)
         AND c.status = 'aceita'`,
      [usuarioId, usuarioId, usuarioId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar conexões aceitas:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

module.exports = router;