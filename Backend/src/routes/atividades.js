const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/auth");

// POST - Salvar sessão de aprendizado
router.post("/sessao", authMiddleware, async (req, res) => {
  const { idioma, idioma_nativo, nivel, tema, explicacao } = req.body;
  const usuario_id = req.usuario.id;

  try {
    const [result] = await db.query(
      `INSERT INTO sessoes_aprendizado (usuario_id, idioma, idioma_nativo, nivel, tema, explicacao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuario_id, idioma, idioma_nativo, nivel, tema, JSON.stringify(explicacao)]
    );
    res.json({ sessao_id: result.insertId });
  } catch (error) {
    console.error("Erro ao salvar sessão:", error);
    res.status(500).json({ mensagem: "Erro ao salvar sessão." });
  }
});

// POST - Salvar resultado do quiz
router.post("/quiz", authMiddleware, async (req, res) => {
  const { sessao_id, idioma, tema, pontuacao, total_questoes, perguntas } = req.body;
  const usuario_id = req.usuario.id;

  try {
    await db.query(
      `INSERT INTO quizzes (usuario_id, sessao_id, idioma, tema, pontuacao, total_questoes, perguntas)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usuario_id, sessao_id, idioma, tema, pontuacao, total_questoes, JSON.stringify(perguntas)]
    );
    res.json({ mensagem: "Quiz salvo com sucesso." });
  } catch (error) {
    console.error("Erro ao salvar quiz:", error);
    res.status(500).json({ mensagem: "Erro ao salvar quiz." });
  }
});

// GET - Top Aprender+ (Ranking)
router.get("/ranking", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        u.id,
        u.nome,
        u.sobrenome,
        COUNT(DISTINCT s.id) AS total_sessoes,
        COUNT(DISTINCT q.id) AS total_quizzes,
        ROUND(AVG(q.pontuacao), 0) AS media_quiz
      FROM usuarios u
      LEFT JOIN sessoes_aprendizado s ON s.usuario_id = u.id
      LEFT JOIN quizzes q ON q.usuario_id = u.id
      GROUP BY u.id
      ORDER BY (COUNT(DISTINCT s.id) + COUNT(DISTINCT q.id)) DESC
      LIMIT 10`
    );

    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    res.status(500).json({ mensagem: "Erro ao buscar ranking." });
  }
});

// GET - Buscar detalhe de uma sessão (específica, vem antes de /:usuario_id)
router.get("/sessao/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT s.id, s.tema, s.idioma, s.nivel, s.criado_em, s.explicacao,
              q.id AS quiz_id, q.pontuacao, q.total_questoes, q.perguntas
       FROM sessoes_aprendizado s
       LEFT JOIN quizzes q ON q.sessao_id = s.id
       WHERE s.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: "Sessão não encontrada." });
    }

    const row = rows[0];

    res.json({
      id: row.id,
      tema: row.tema,
      idioma: row.idioma,
      nivel: row.nivel,
      criado_em: row.criado_em,
      explicacao: row.explicacao ? JSON.parse(row.explicacao) : null,
      quiz: row.perguntas
        ? {
            quiz_id: row.quiz_id,
            pontuacao: row.pontuacao,
            total_questoes: row.total_questoes,
            perguntas: JSON.parse(row.perguntas),
          }
        : null,
    });
  } catch (error) {
    console.error("Erro ao buscar detalhe da sessão:", error);
    res.status(500).json({ mensagem: "Erro ao buscar detalhe." });
  }
});

// GET - Buscar progresso do usuário (específica, vem antes de /:usuario_id)
router.get("/progresso/:usuario_id/", authMiddleware, async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const [[resumo]] = await db.query(
      `SELECT
        (SELECT COUNT(*) FROM sessoes_aprendizado WHERE usuario_id = ?) AS total_sessoes,
        (SELECT COUNT(*) FROM quizzes WHERE usuario_id = ?) AS total_quizzes,
        (SELECT ROUND(AVG(pontuacao), 0) FROM quizzes WHERE usuario_id = ?) AS media_geral`,
      [usuario_id, usuario_id, usuario_id]
    );

    const [por_idioma] = await db.query(
      `SELECT
        idioma,
        ROUND(AVG(pontuacao), 0) AS media,
        COUNT(*) AS total_quizzes
       FROM quizzes
       WHERE usuario_id = ?
       GROUP BY idioma
       ORDER BY media DESC`,
      [usuario_id]
    );

    const [historico] = await db.query(
      `SELECT id, tema, idioma, pontuacao, total_questoes, criado_em
       FROM quizzes
       WHERE usuario_id = ?
       ORDER BY criado_em DESC
       LIMIT 10`,
      [usuario_id]
    );

    res.json({ resumo, por_idioma, historico });
  } catch (error) {
    console.error("Erro ao buscar progresso:", error);
    res.status(500).json({ mensagem: "Erro ao buscar progresso." });
  }
});

// GET - Buscar atividades do usuário (genérica, sempre por último)
router.get("/lista/:usuario_id", authMiddleware, async (req, res) => {
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