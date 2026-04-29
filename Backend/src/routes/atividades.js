const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/auth");


// Salvar sessão de aprendizado
router.post("/sessao", authMiddleware, async (req, res) => {
  const { idioma, idioma_nativo, nivel, tema } = req.body;
  const usuario_id = req.usuario.id;

  try {
    const [result] = await db.query(
      `INSERT INTO sessoes_aprendizado (usuario_id, idioma, idioma_nativo, nivel, tema)
       VALUES (?, ?, ?, ?, ?)`,
      [usuario_id, idioma, idioma_nativo, nivel, tema]
    );

    res.json({ sessao_id: result.insertId });
  } catch (error) {
    console.error("Erro ao salvar sessão:", error);
    res.status(500).json({ mensagem: "Erro ao salvar sessão." });
  }
});

// Salvar resultado do quiz
router.post("/quiz", authMiddleware, async (req, res) => {
  const { sessao_id, idioma, tema, pontuacao, total_questoes } = req.body;
  const usuario_id = req.usuario.id;

  try {
    await db.query(
      `INSERT INTO quizzes (usuario_id, sessao_id, idioma, tema, pontuacao, total_questoes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuario_id, sessao_id, idioma, tema, pontuacao, total_questoes]
    );

    res.json({ mensagem: "Quiz salvo com sucesso." });
  } catch (error) {
    console.error("Erro ao salvar quiz:", error);
    res.status(500).json({ mensagem: "Erro ao salvar quiz." });
  }
});

// Buscar atividades do usuário para a aba perfil
router.get("/:usuario_id", authMiddleware, async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const [sessoes] = await db.query(
      `SELECT 'aprendizado' AS tipo, id, tema, idioma, nivel, criado_em, NULL AS pontuacao, NULL AS total_questoes
       FROM sessoes_aprendizado
       WHERE usuario_id = ?`,
      [usuario_id]
    );

    const [quizzes] = await db.query(
      `SELECT 'quiz' AS tipo, id, tema, idioma, NULL AS nivel, criado_em, pontuacao, total_questoes
       FROM quizzes
       WHERE usuario_id = ?`,
      [usuario_id]
    );

    const [postsRaw] = await db.query(
      `SELECT 'post' AS tipo, id, titulo AS tema, idioma, NULL AS nivel, criado_em, NULL AS pontuacao, NULL AS total_questoes
       FROM posts
       WHERE usuario_id = ?`,
      [usuario_id]
    );

    // Une tudo e ordena do mais recente para o mais antigo
    const atividades = [...sessoes, ...quizzes, ...postsRaw].sort(
      (a, b) => new Date(b.criado_em) - new Date(a.criado_em)
    );

    res.json(atividades);
  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
    res.status(500).json({ mensagem: "Erro ao buscar atividades." });
  }
});

module.exports = router;