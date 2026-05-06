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
    const { filtro } = req.query;
    const usuario_id = req.usuario.id;

    let whereClause = "";
    const params = [];

    if (filtro === "seguindo") {
      whereClause = `WHERE p.usuario_id IN (
        SELECT CASE WHEN solicitante_id = ? THEN receptor_id ELSE solicitante_id END
        FROM conexoes
        WHERE (solicitante_id = ? OR receptor_id = ?) AND status = 'aceita'
      )`;
      params.push(usuario_id, usuario_id, usuario_id);
    }

    params.push(usuario_id);

    const [rows] = await db.query(
      `SELECT p.id, p.titulo, p.conteudo, p.idioma, p.tipo, p.pontuacao_quiz,
              p.dados_aprendizado, p.criado_em, p.atualizado_em,
              u.id AS usuario_id, u.nome, u.sobrenome, u.idioma_nativo,
              (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS total_likes,
              (SELECT COUNT(*) FROM comentarios WHERE post_id = p.id) AS total_comentarios,
              EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND usuario_id = ?) AS curtiu
       FROM posts p
       JOIN usuarios u ON p.usuario_id = u.id
       ${whereClause}
       ORDER BY p.criado_em DESC`,
      params
    );

    // Parseia o campo dados_aprendizado para cada post do tipo aprendizado
    const postsTratados = rows.map((post) => ({
      ...post,
      curtiu: !!post.curtiu,
      dados_aprendizado:
        post.dados_aprendizado && typeof post.dados_aprendizado === "string"
          ? JSON.parse(post.dados_aprendizado)
          : post.dados_aprendizado,
    }));

    res.json(postsTratados);
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

// ─── Compartilhar aprendizado na comunidade ───────────────────────
router.post("/compartilhar-aprendizado", authMiddleware, async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { topico, idioma, nivel, pontuacao, explicacao, quiz } = req.body;

    if (!topico || !idioma || !nivel || pontuacao === undefined) {
      return res.status(400).json({ mensagem: "Tópico, idioma, nível e pontuação são obrigatórios." });
    }

    // Monta o título e conteúdo automaticamente
    const titulo = `Estudei ${topico} em ${idioma}!`;
    const conteudo = `Acabei de completar uma sessão de aprendizado sobre "${topico}" no nível ${nivel} e tirei ${pontuacao}% no quiz! Confira a explicação e tente o quiz também.`;

    // Dados do aprendizado para guardar no banco
    const dados_aprendizado = JSON.stringify({ topico, nivel, explicacao, quiz });

    const [result] = await db.query(
      `INSERT INTO posts 
        (usuario_id, titulo, conteudo, idioma, tipo, pontuacao_quiz, dados_aprendizado) 
       VALUES (?, ?, ?, ?, 'aprendizado', ?, ?)`,
      [usuario_id, titulo, conteudo, idioma, pontuacao, dados_aprendizado]
    );

    res.status(201).json({
      mensagem: "Aprendizado compartilhado com sucesso!",
      post: {
        id: result.insertId,
        usuario_id,
        titulo,
        conteudo,
        idioma,
        tipo: "aprendizado",
        pontuacao_quiz: pontuacao,
        criado_em: new Date(),
      },
    });
  } catch (error) {
    console.error("Erro ao compartilhar aprendizado:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
});

// ─── Likes e Comentarios ──────────────────────────────────────────

router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { id: post_id } = req.params;
    
    await db.query(
      "INSERT IGNORE INTO likes (post_id, usuario_id) VALUES (?, ?)",
      [post_id, usuario_id]
    );
    res.json({ mensagem: "Like adicionado com sucesso." });
  } catch (error) {
    console.error("Erro ao adicionar like:", error);
    res.status(500).json({ mensagem: "Erro ao curtir post." });
  }
});

router.delete("/:id/like", authMiddleware, async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { id: post_id } = req.params;
    
    await db.query(
      "DELETE FROM likes WHERE post_id = ? AND usuario_id = ?",
      [post_id, usuario_id]
    );
    res.json({ mensagem: "Like removido com sucesso." });
  } catch (error) {
    console.error("Erro ao remover like:", error);
    res.status(500).json({ mensagem: "Erro ao remover curtir do post." });
  }
});

router.post("/:id/comentarios", authMiddleware, async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { id: post_id } = req.params;
    const { conteudo } = req.body;
    
    if (!conteudo) {
      return res.status(400).json({ mensagem: "Conteúdo do comentário é obrigatório." });
    }

    const [result] = await db.query(
      "INSERT INTO comentarios (post_id, usuario_id, conteudo) VALUES (?, ?, ?)",
      [post_id, usuario_id, conteudo]
    );

    res.status(201).json({ mensagem: "Comentário adicionado com sucesso.", comentario_id: result.insertId });
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    res.status(500).json({ mensagem: "Erro ao comentar no post." });
  }
});

router.get("/:id/comentarios", authMiddleware, async (req, res) => {
  try {
    const { id: post_id } = req.params;
    
    const [rows] = await db.query(
      `SELECT c.id, c.conteudo, c.criado_em,
              u.id AS usuario_id, u.nome, u.sobrenome
       FROM comentarios c
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.criado_em ASC`,
      [post_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    res.status(500).json({ mensagem: "Erro ao buscar comentários." });
  }
});

module.exports = router;