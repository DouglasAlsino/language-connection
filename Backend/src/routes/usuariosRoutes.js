const express = require("express");
const router = express.Router();


const authMiddleware = require("../middleware/auth");


const db = require("../config/db");


router.get("/", authMiddleware, async (req, res) => {
  try {
    const idUsuarioLogado = req.usuario.id;
    
    const [usuarios] = await db.query(
      `SELECT id, nome, sobrenome, idioma_nativo, idiomas_aprender, nivel, bio
       FROM usuarios
       WHERE id != ? AND role != 'admin'
       ORDER BY criado_em DESC`,
       [idUsuarioLogado]
    );

    res.json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});


router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT id, nome, sobrenome, idioma_nativo, idiomas_aprender, nivel, bio
       FROM usuarios
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});


router.put("/:id", authMiddleware, async (req, res) => {
  console.log("id da URL:", req.params.id, typeof req.params.id);
  console.log("id do token:", req.usuarioId, typeof req.usuario.id);
  const { id } = req.params;
  const { bio, idioma_nativo, idiomas_aprender, nivel } = req.body;

  
  if (parseInt(id) !== req.usuario.id) {
    return res.status(403).json({ mensagem: "Acesso negado." });
  }

  try {
    await db.query(
      `UPDATE usuarios 
       SET bio = ?, idioma_nativo = ?, idiomas_aprender = ?, nivel = ?
       WHERE id = ?`,
      [bio, idioma_nativo, idiomas_aprender, nivel, id]
    );

    res.json({ mensagem: "Perfil atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
});

module.exports = router;
