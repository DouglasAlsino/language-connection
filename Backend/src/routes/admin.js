const express = require("express");
const router = express.Router();
const authAdmin = require("../middleware/authAdmin");
const db = require("../config/db");

// ─── Dashboard — métricas gerais ─────────────────────────────────
router.get("/dashboard", authAdmin, async (req, res) => {
  try {
    const [[{ total_usuarios }]] = await db.query(
      "SELECT COUNT(*) as total_usuarios FROM usuarios WHERE role = 'user'"
    );
    const [[{ total_posts }]] = await db.query(
      "SELECT COUNT(*) as total_posts FROM posts"
    );
    const [[{ denuncias_pendentes }]] = await db.query(
      "SELECT COUNT(*) as denuncias_pendentes FROM denuncias WHERE status = 'pendente'"
    );
    const [[{ contas_banidas }]] = await db.query(
      "SELECT COUNT(*) as contas_banidas FROM usuarios WHERE banido = TRUE"
    );
    const [[{ novos_esta_semana }]] = await db.query(
      `SELECT COUNT(*) as novos_esta_semana FROM usuarios 
       WHERE criado_em >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND role = 'user'`
    );
    const [[{ posts_hoje }]] = await db.query(
      `SELECT COUNT(*) as posts_hoje FROM posts 
       WHERE DATE(criado_em) = CURDATE()`
    );
    const [idiomas_em_alta] = await db.query(
      `SELECT idioma, COUNT(*) as total 
       FROM posts 
       GROUP BY idioma 
       ORDER BY total DESC 
       LIMIT 5`
    );
    const [atividade_recente] = await db.query(
      `(SELECT 'post' as tipo, 
          CONCAT(u.nome, ' ', u.sobrenome, ' publicou um post em ', p.idioma) as descricao, 
          p.criado_em as data
        FROM posts p 
        JOIN usuarios u ON u.id = p.usuario_id 
        ORDER BY p.criado_em DESC LIMIT 5)
       UNION ALL
       (SELECT 'denuncia' as tipo, 
          CONCAT(u.nome, ' denunciou um post — motivo: ', d.motivo) as descricao, 
          d.criado_em as data
        FROM denuncias d 
        JOIN usuarios u ON u.id = d.usuario_id 
        ORDER BY d.criado_em DESC LIMIT 5)
       UNION ALL
       (SELECT 'usuario' as tipo, 
          CONCAT(nome, ' ', sobrenome, ' entrou na comunidade') as descricao, 
          criado_em as data
        FROM usuarios 
        WHERE role = 'user' 
        ORDER BY criado_em DESC LIMIT 5)
       ORDER BY data DESC
       LIMIT 10`
    );

    res.json({
      total_usuarios,
      total_posts,
      denuncias_pendentes,
      contas_banidas,
      novos_esta_semana,
      posts_hoje,
      idiomas_em_alta,
      atividade_recente,
    });
  } catch (error) {
    console.error("Erro no dashboard:", error);
    res.status(500).json({ mensagem: "Erro ao buscar métricas." });
  }
});

// ─── Posts — listar todos ─────────────────────────────────────────
router.get("/posts", authAdmin, async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT p.id, p.titulo, p.conteudo, p.idioma, p.tipo, p.criado_em,
              u.id as usuario_id, u.nome, u.sobrenome, u.email
       FROM posts p
       JOIN usuarios u ON u.id = p.usuario_id
       ORDER BY p.criado_em DESC`
    );
    res.json(posts);
  } catch (error) {
    console.error("Erro ao listar posts:", error);
    res.status(500).json({ mensagem: "Erro ao buscar posts." });
  }
});

// ─── Posts — excluir ──────────────────────────────────────────────
router.delete("/posts/:id", authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [[post]] = await db.query("SELECT id FROM posts WHERE id = ?", [id]);

    if (!post) {
      return res.status(404).json({ mensagem: "Post não encontrado." });
    }

    await db.query("DELETE FROM posts WHERE id = ?", [id]);
    res.json({ mensagem: "Post excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir post:", error);
    res.status(500).json({ mensagem: "Erro ao excluir post." });
  }
});

// ─── Usuários — listar todos ──────────────────────────────────────
router.get("/usuarios", authAdmin, async (req, res) => {
  try {
    const [usuarios] = await db.query(
      `SELECT id, nome, sobrenome, email, idioma_nativo, nivel, 
              role, banido, criado_em
       FROM usuarios
       WHERE role = 'user'
       ORDER BY criado_em DESC`
    );
    res.json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ mensagem: "Erro ao buscar usuários." });
  }
});

// ─── Usuários — banir ─────────────────────────────────────────────
router.put("/usuarios/:id/banir", authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [[usuario]] = await db.query(
      "SELECT id, banido FROM usuarios WHERE id = ? AND role = 'user'",
      [id]
    );

    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }
    if (usuario.banido) {
      return res.status(400).json({ mensagem: "Usuário já está banido." });
    }

    await db.query("UPDATE usuarios SET banido = TRUE WHERE id = ?", [id]);
    res.json({ mensagem: "Usuário banido com sucesso." });
  } catch (error) {
    console.error("Erro ao banir usuário:", error);
    res.status(500).json({ mensagem: "Erro ao banir usuário." });
  }
});

// ─── Usuários — desbanir ──────────────────────────────────────────
router.put("/usuarios/:id/desbanir", authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [[usuario]] = await db.query(
      "SELECT id, banido FROM usuarios WHERE id = ? AND role = 'user'",
      [id]
    );

    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }
    if (!usuario.banido) {
      return res.status(400).json({ mensagem: "Usuário não está banido." });
    }

    await db.query("UPDATE usuarios SET banido = FALSE WHERE id = ?", [id]);
    res.json({ mensagem: "Usuário desbanido com sucesso." });
  } catch (error) {
    console.error("Erro ao desbanir usuário:", error);
    res.status(500).json({ mensagem: "Erro ao desbanir usuário." });
  }
});

// ─── Denúncias — listar todas ─────────────────────────────────────
router.get("/denuncias", authAdmin, async (req, res) => {
  try {
    const [denuncias] = await db.query(
      `SELECT d.id, d.motivo, d.status, d.criado_em,
              p.id as post_id, p.titulo as post_titulo, p.conteudo as post_conteudo,
              u.id as denunciante_id, u.nome as denunciante_nome, u.sobrenome as denunciante_sobrenome,
              ua.nome as autor_post_nome, ua.sobrenome as autor_post_sobrenome
       FROM denuncias d
       JOIN posts p ON p.id = d.post_id
       JOIN usuarios u ON u.id = d.usuario_id
       JOIN usuarios ua ON ua.id = p.usuario_id
       ORDER BY 
         CASE WHEN d.status = 'pendente' THEN 0 ELSE 1 END,
         d.criado_em DESC`
    );
    res.json(denuncias);
  } catch (error) {
    console.error("Erro ao listar denúncias:", error);
    res.status(500).json({ mensagem: "Erro ao buscar denúncias." });
  }
});

// ─── Denúncias — resolver ou ignorar ─────────────────────────────
router.put("/denuncias/:id", authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["resolvida", "ignorada"].includes(status)) {
      return res.status(400).json({ mensagem: "Status inválido. Use 'resolvida' ou 'ignorada'." });
    }

    const [[denuncia]] = await db.query(
      "SELECT id FROM denuncias WHERE id = ?",
      [id]
    );

    if (!denuncia) {
      return res.status(404).json({ mensagem: "Denúncia não encontrada." });
    }

    await db.query("UPDATE denuncias SET status = ? WHERE id = ?", [status, id]);
    res.json({ mensagem: `Denúncia marcada como ${status}.` });
  } catch (error) {
    console.error("Erro ao atualizar denúncia:", error);
    res.status(500).json({ mensagem: "Erro ao atualizar denúncia." });
  }
});

// ─── Denúncias — resolver e excluir post ─────────────────────────
router.put("/denuncias/:id/resolver-e-excluir", authAdmin, async (req, res) => {
  const connection = await db.getConnection(); // Inicia uma transação
  try {
    await connection.beginTransaction();
    const { id } = req.params;

    // 1. Busca a denúncia para pegar o post_id
    const [[denuncia]] = await connection.query(
      "SELECT post_id FROM denuncias WHERE id = ?",
      [id]
    );

    if (!denuncia) {
      await connection.rollback();
      return res.status(404).json({ mensagem: "Denúncia não encontrada." });
    }

    const postId = denuncia.post_id;

    // 2. Exclui o post
    await connection.query("DELETE FROM posts WHERE id = ?", [postId]);

    // 3. Marca a denúncia como resolvida
    await connection.query("UPDATE denuncias SET status = 'resolvida' WHERE id = ?", [id]);

    await connection.commit(); // Confirma a transação
    res.json({ mensagem: "Denúncia resolvida e post excluído com sucesso." });
  } catch (error) {
    await connection.rollback(); // Desfaz a transação em caso de erro
    console.error("Erro ao resolver denúncia e excluir post:", error);
    res.status(500).json({ mensagem: "Erro interno ao processar a ação." });
  } finally {
    connection.release(); // Libera a conexão
  }
});

module.exports = router;