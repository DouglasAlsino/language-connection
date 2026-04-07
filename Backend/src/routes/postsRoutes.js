const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/auth");

// ─── Criar um novo post ───────────────────────────────────────────
router.post("/", authMiddleware, async (req, res) => {
  try {
    const usuario_id = req.usuario.id; // ID do usuário logado
    const { titulo, conteudo, idioma } = req.body; // Adicionado 'idioma'

    if (!titulo || !conteudo || !idioma) { // 'idioma' agora é obrigatório
      return res.status(400).json({ mensagem: "Título, conteúdo e idioma são obrigatórios." });
    }

    const [result] = await db.query(
      "INSERT INTO posts (usuario_id, titulo, conteudo, idioma) VALUES (?, ?, ?, ?)", // Adicionado 'idioma'
      [usuario_id, titulo, conteudo, idioma] // Adicionado 'idioma'
    );

    res.status(201).json({
      mensagem: "Post criado com sucesso!",
      post: { id: result.insertId, usuario_id, titulo, conteudo, idioma, criado_em: new Date() } // Adicionado 'idioma'
    });
  } catch (error) {
    console.error("Erro ao criar post:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

// ─── Listar todos os posts (feed da comunidade) ───────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Busca todos os posts, juntando com as informações do usuário que postou
    const [rows] = await db.query(
      `SELECT p.id, p.titulo, p.conteudo, p.idioma, p.criado_em, p.atualizado_em,
              u.id AS usuario_id, u.nome, u.sobrenome, u.idioma_nativo
       FROM posts p
       JOIN usuarios u ON p.usuario_id = u.id
       ORDER BY p.criado_em DESC` // Adicionado 'p.idioma'
    );

    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar posts:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

// ─── Obter um post específico pelo ID ─────────────────────────────
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT p.id, p.titulo, p.conteudo, p.idioma, p.criado_em, p.atualizado_em,
              u.id AS usuario_id, u.nome, u.sobrenome, u.idioma_nativo
       FROM posts p
       JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.id = ?`, // Adicionado 'p.idioma'
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: "Post não encontrado." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao obter post:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

// ─── Atualizar um post (apenas o dono pode) ───────────────────────
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { id } = req.params;
    const { titulo, conteudo, idioma } = req.body; // Adicionado 'idioma'

    if (!titulo || !conteudo || !idioma) { // 'idioma' agora é obrigatório
      return res.status(400).json({ mensagem: "Título, conteúdo e idioma são obrigatórios." });
    }

    const [result] = await db.query(
      "UPDATE posts SET titulo = ?, conteudo = ?, idioma = ? WHERE id = ? AND usuario_id = ?", // Adicionado 'idioma'
      [titulo, conteudo, idioma, id, usuario_id] // Adicionado 'idioma'
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ mensagem: "Post não encontrado ou você não tem permissão para editá-lo." });
    }

    res.json({ mensagem: "Post atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar post:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

// ─── Deletar um post (apenas o dono pode) ─────────────────────────
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM posts WHERE id = ? AND usuario_id = ?",
      [id, usuario_id]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ mensagem: "Post não encontrado ou você não tem permissão para deletá-lo." });
    }

    res.json({ mensagem: "Post deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar post:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

module.exports = router;