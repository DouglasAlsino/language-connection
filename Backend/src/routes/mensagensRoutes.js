const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/auth");

// Busca o histórico de mensagens entre o usuário logado e outro usuário
router.get("/:outroUsuarioId", authMiddleware, async (req, res) => {
  try {
    const meuId = req.usuario.id;
    const outroId = req.params.outroUsuarioId;

    const [rows] = await db.query(
      `SELECT * FROM mensagens
       WHERE (remetente_id = ? AND destinatario_id = ?)
          OR (remetente_id = ? AND destinatario_id = ?)
       ORDER BY criado_em ASC`,
      [meuId, outroId, outroId, meuId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

module.exports = router;