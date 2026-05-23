import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import "./Community.css";
import AprendizadoModal from "../../components/AprendizadoModal/AprendizadoModal.jsx";

const TRENDS = [
  { tag: "FuturoSimples", count: 124 },
  { tag: "DicaDoDia",     count: 98  },
  { tag: "Kanji",         count: 76  },
  { tag: "Pronúncia",     count: 54  },
];

const CORES_AVATAR = ["#8B5CF6", "#06B6D4", "#10b981", "#F59E0B", "#EF4444"];

const MOTIVOS_DENUNCIA = [
  "Conteúdo inapropriado",
  "Spam",
  "Desinformação",
  "Assédio",
  "Outro",
];

function Community() {
  const [posts, setPosts] = useState([]);
  const [novoPostTitulo, setNovoPostTitulo] = useState("");
  const [novoPostConteudo, setNovoPostConteudo] = useState("");
  const [novoPostIdioma, setNovoPostIdioma] = useState("");
  const [carregandoPosts, setCarregandoPosts] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");
  const [abaAtiva, setAbaAtiva] = useState("recentes");
  const [busca, setBusca] = useState("");
  const [comentarioAberto, setComentarioAberto] = useState(null);
  const [textoComentario, setTextoComentario] = useState("");
  const [comentariosPost, setComentariosPost] = useState({});
  const [topUsers, setTopUsers] = useState([]);
  const [postModalAberto, setPostModalAberto] = useState(null);

  // ── Estados da denúncia ──────────────────────────────────────────
  const [denunciaModal, setDenunciaModal] = useState(null); // post_id ou null
  const [motivoSelecionado, setMotivoSelecionado] = useState("");
  const [denunciaStatus, setDenunciaStatus] = useState(""); // "sucesso" | "erro" | ""
  const [enviandoDenuncia, setEnviandoDenuncia] = useState(false);

  const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const token = localStorage.getItem("token");

  const buscarPosts = async () => {
    setErro("");
    try {
      const url = abaAtiva === "seguindo"
        ? "http://localhost:3000/posts?filtro=seguindo"
        : "http://localhost:3000/posts";
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (JSON.stringify(response.data) !== JSON.stringify(posts)) {
        setPosts(response.data);
      }
    } catch (err) {
      setErro("Não foi possível carregar os posts.");
    } finally {
      setCarregandoPosts(false);
    }
  };

  const buscarRanking = async () => {
    try {
      const response = await axios.get("http://localhost:3000/atividades/ranking", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTopUsers(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    buscarPosts();
    buscarRanking();
    const intervalo = setInterval(buscarPosts, 15000);
    return () => clearInterval(intervalo);
  }, [abaAtiva]);

  const criarPost = async (e) => {
    e.preventDefault();
    setErro("");
    if (!novoPostTitulo.trim() || !novoPostConteudo.trim() || !novoPostIdioma.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:3000/posts",
        { titulo: novoPostTitulo, conteudo: novoPostConteudo, idioma: novoPostIdioma },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNovoPostTitulo("");
      setNovoPostConteudo("");
      setNovoPostIdioma("");
      buscarPosts();
    } catch (err) {
      setErro("Não foi possível criar o post.");
    }
  };

  const toggleLike = async (postId, curtiu) => {
    try {
      if (curtiu) {
        await axios.delete(`http://localhost:3000/posts/${postId}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, curtiu: false, total_likes: p.total_likes - 1 } : p
          )
        );
      } else {
        await axios.post(`http://localhost:3000/posts/${postId}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, curtiu: true, total_likes: p.total_likes + 1 } : p
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const buscarComentarios = async (postId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/posts/${postId}/comentarios`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComentariosPost((prev) => ({ ...prev, [postId]: response.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComentario = (postId) => {
    if (comentarioAberto === postId) {
      setComentarioAberto(null);
    } else {
      setComentarioAberto(postId);
      setTextoComentario("");
      buscarComentarios(postId);
    }
  };

  const enviarComentario = async (postId) => {
    if (!textoComentario.trim()) return;
    try {
      await axios.post(
        `http://localhost:3000/posts/${postId}/comentarios`,
        { conteudo: textoComentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTextoComentario("");
      buscarComentarios(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, total_comentarios: p.total_comentarios + 1 } : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ── Handlers de denúncia ─────────────────────────────────────────
  const abrirDenuncia = (postId) => {
    setDenunciaModal(postId);
    setMotivoSelecionado("");
    setDenunciaStatus("");
  };

  const fecharDenuncia = () => {
    setDenunciaModal(null);
    setMotivoSelecionado("");
    setDenunciaStatus("");
  };

  const enviarDenuncia = async () => {
    if (!motivoSelecionado) return;
    setEnviandoDenuncia(true);
    try {
      await axios.post(
        `http://localhost:3000/posts/${denunciaModal}/denunciar`,
        { motivo: motivoSelecionado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDenunciaStatus("sucesso");
      setTimeout(() => fecharDenuncia(), 2000);
    } catch (err) {
      const msg = err.response?.data?.mensagem || "Erro ao enviar denúncia.";
      setDenunciaStatus(msg);
    } finally {
      setEnviandoDenuncia(false);
    }
  };

  const postsFiltrados = posts
    .filter((p) => filtroAtivo === "Todos" || p.idioma?.toLowerCase().includes(filtroAtivo.toLowerCase()))
    .filter((p) => !busca.trim() || p.titulo?.toLowerCase().includes(busca.toLowerCase()) || p.conteudo?.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => {
      if (abaAtiva === "populares") {
        return (b.total_likes + b.total_comentarios) - (a.total_likes + a.total_comentarios);
      }
      return 0;
    });

  const filtros = ["Todos", "Português", "Inglês", "Espanhol", "Francês", "Alemão", "Japonês"];

  return (
    <div className="comm-page">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="comm-hero">
        <div className="comm-hero-left">
          <span className="comm-hero-badge">👥 Comunidade</span>
          <h1 className="comm-hero-title">
            Compartilhe sua <span className="comm-hero-destaque">jornada</span> com o mundo
          </h1>
          <p className="comm-hero-sub">
            Poste conquistas, troque dicas e aprenda com pessoas estudando os mesmos idiomas que você.
          </p>
        </div>
        <div className="comm-hero-stats">
          <div className="comm-stat">
            <div className="comm-stat-num">12.4k</div>
            <div className="comm-stat-label">MEMBROS</div>
          </div>
          <div className="comm-stat-divider" />
          <div className="comm-stat">
            <div className="comm-stat-num">{posts.length}</div>
            <div className="comm-stat-label">POSTS</div>
          </div>
          <div className="comm-stat-divider" />
          <div className="comm-stat">
            <div className="comm-stat-num">14</div>
            <div className="comm-stat-label">IDIOMAS</div>
          </div>
        </div>
      </div>

      {/* ── Grid principal ───────────────────────────────────────── */}
      <div className="comm-grid">

        {/* COLUNA ESQUERDA */}
        <aside className="comm-sidebar">
          <div className="comm-card">
            <div className="comm-card-title"><span>⚡</span> Filtrar por idioma</div>
            <div className="comm-chips">
              {filtros.map((f) => (
                <span
                  key={f}
                  className={`comm-chip ${filtroAtivo === f ? "ativo" : ""}`}
                  onClick={() => setFiltroAtivo(f)}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="comm-card">
            <div className="comm-card-title"><span>📈</span> Em alta</div>
            <div className="comm-trends">
              {TRENDS.map((t) => (
                <div key={t.tag} className="comm-trend-item">
                  <span className="comm-trend-hash">#</span>
                  <span className="comm-trend-tag">{t.tag}</span>
                  <span className="comm-trend-count">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* COLUNA CENTRAL */}
        <main className="comm-feed">

          <div className="comm-card comm-create">
            <div className="comm-create-avatar" style={{ background: "linear-gradient(135deg,#4f46e5,#06b6d4)" }}>
              {usuarioLogado.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="comm-create-body">
              {erro && <p className="comm-erro">{erro}</p>}
              <input
                className="comm-create-input"
                placeholder="Título do seu post"
                value={novoPostTitulo}
                onChange={(e) => setNovoPostTitulo(e.target.value)}
              />
              <textarea
                className="comm-create-textarea"
                placeholder="O que você gostaria de compartilhar?"
                value={novoPostConteudo}
                onChange={(e) => setNovoPostConteudo(e.target.value)}
                rows={3}
              />
              <div className="comm-create-footer">
                <select
                  className="comm-create-select"
                  value={novoPostIdioma}
                  onChange={(e) => setNovoPostIdioma(e.target.value)}
                >
                  <option value="">Selecione o idioma</option>
                  <option>Português</option>
                  <option>Inglês</option>
                  <option>Espanhol</option>
                  <option>Francês</option>
                  <option>Alemão</option>
                  <option>Japonês</option>
                </select>
                <button className="comm-btn-publicar" onClick={criarPost}>
                  ➤ Publicar
                </button>
              </div>
            </div>
          </div>

          <div className="comm-feed-bar">
            <div className="comm-tabs">
              {["recentes", "populares", "seguindo"].map((aba) => (
                <button
                  key={aba}
                  className={`comm-tab ${abaAtiva === aba ? "ativo" : ""}`}
                  onClick={() => setAbaAtiva(aba)}
                >
                  {aba.charAt(0).toUpperCase() + aba.slice(1)}
                </button>
              ))}
            </div>
            <div className="comm-busca">
              <span>🔍</span>
              <input
                placeholder="Buscar na comunidade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          {carregandoPosts ? (
            <p className="comm-loading">Carregando posts...</p>
          ) : postsFiltrados.length === 0 ? (
            <div className="comm-empty">
              <p>Nenhum post encontrado para esse filtro.</p>
              <span onClick={() => { setFiltroAtivo("Todos"); setBusca(""); }}>
                Ver todos os posts
              </span>
            </div>
          ) : (
            postsFiltrados.map((post) =>
              post.tipo === "aprendizado" ? (
                <PostAprendizadoCard
                  key={post.id}
                  post={post}
                  usuarioLogadoId={usuarioLogado.id}
                  onLike={() => toggleLike(post.id, post.curtiu)}
                  comentarioAberto={comentarioAberto === post.id}
                  onToggleComentario={() => toggleComentario(post.id)}
                  textoComentario={textoComentario}
                  onChangeComentario={(e) => setTextoComentario(e.target.value)}
                  onEnviarComentario={() => enviarComentario(post.id)}
                  comentariosLista={comentariosPost[post.id] || []}
                  onAbrirModal={() => setPostModalAberto(post)}
                  onDenunciar={() => abrirDenuncia(post.id)}
                />
              ) : (
                <PostCard
                  key={post.id}
                  post={post}
                  usuarioLogadoId={usuarioLogado.id}
                  onLike={() => toggleLike(post.id, post.curtiu)}
                  comentarioAberto={comentarioAberto === post.id}
                  onToggleComentario={() => toggleComentario(post.id)}
                  textoComentario={textoComentario}
                  onChangeComentario={(e) => setTextoComentario(e.target.value)}
                  onEnviarComentario={() => enviarComentario(post.id)}
                  comentariosLista={comentariosPost[post.id] || []}
                  onDenunciar={() => abrirDenuncia(post.id)}
                />
              )
            )
          )}
        </main>

        {/* COLUNA DIREITA */}
        <aside className="comm-right">
          <div className="comm-card comm-top-card">
            <div className="comm-top-header">
              <span>🏆</span>
              <div>
                <div className="comm-top-titulo">Top Aprender+</div>
                <div className="comm-top-sub">Os aprendizes mais ativos</div>
              </div>
            </div>
            {topUsers.length === 0 ? (
              <p style={{ padding: "0 1rem", fontSize: "0.85rem", color: "#6b7280" }}>Sem dados no momento.</p>
            ) : (
              topUsers.map((s, idx) => (
                <div key={s.id} className="comm-top-item">
                  <span className="comm-top-pos">{idx + 1}</span>
                  <div className="comm-top-avatar" style={{ background: CORES_AVATAR[idx % CORES_AVATAR.length] }}>
                    {s.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="comm-top-info">
                    <strong>{s.nome} {s.sobrenome}</strong>
                    <span>{s.total_sessoes} Sessões / {s.total_quizzes} Quizzes</span>
                  </div>
                  <span className="comm-top-xp">🔥</span>
                </div>
              ))
            )}
          </div>

          <div className="comm-card">
            <div className="comm-card-title"><span>🎯</span> Sugestão de estudo</div>
            <p className="comm-sugestao-texto">
              Que tal revisar <strong>Pretérito Perfeito</strong> em Espanhol hoje?
            </p>
            <button className="comm-btn-iniciar">✦ Iniciar sessão</button>
          </div>
        </aside>
      </div>

      {/* ── Modal de denúncia ────────────────────────────────────── */}
      {denunciaModal && (
        <div className="comm-modal-overlay" onClick={fecharDenuncia}>
          <div className="comm-modal-denuncia" onClick={(e) => e.stopPropagation()}>
            <div className="comm-modal-header">
              <h3>⚑ Denunciar post</h3>
              <button className="comm-modal-fechar" onClick={fecharDenuncia}>✕</button>
            </div>

            {denunciaStatus === "sucesso" ? (
              <div className="comm-denuncia-sucesso">
                <span>✓</span>
                <p>Denúncia enviada! Nossa equipe irá analisar em breve.</p>
              </div>
            ) : (
              <>
                <p className="comm-modal-sub">
                  Selecione o motivo da denúncia. Nossa equipe irá analisar e tomar as medidas cabíveis.
                </p>

                <div className="comm-motivos">
                  {MOTIVOS_DENUNCIA.map((motivo) => (
                    <button
                      key={motivo}
                      className={`comm-motivo-btn ${motivoSelecionado === motivo ? "ativo" : ""}`}
                      onClick={() => setMotivoSelecionado(motivo)}
                    >
                      {motivoSelecionado === motivo ? "● " : "○ "}
                      {motivo}
                    </button>
                  ))}
                </div>

                {denunciaStatus && denunciaStatus !== "sucesso" && (
                  <p className="comm-denuncia-erro">{denunciaStatus}</p>
                )}

                <div className="comm-modal-footer">
                  <button className="comm-btn-cancelar" onClick={fecharDenuncia}>
                    Cancelar
                  </button>
                  <button
                    className="comm-btn-denunciar"
                    onClick={enviarDenuncia}
                    disabled={!motivoSelecionado || enviandoDenuncia}
                  >
                    {enviandoDenuncia ? "Enviando..." : "Enviar denúncia"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {postModalAberto && (
        <AprendizadoModal
          post={postModalAberto}
          onFechar={() => setPostModalAberto(null)}
        />
      )}
    </div>
  );
}

// ── PostAprendizadoCard ────────────────────────────────────────────
function PostAprendizadoCard({ post, usuarioLogadoId, onLike, comentarioAberto, onToggleComentario, textoComentario, onChangeComentario, onEnviarComentario, comentariosLista, onAbrirModal, onDenunciar }) {
  return (
    <article className="comm-post comm-post-aprendizado">
      <div className="comm-post-avatar" style={{ background: "linear-gradient(135deg,#10b981,#4f46e5)" }}>
        {post.nome?.charAt(0).toUpperCase()}
      </div>
      <div className="comm-post-body">
        <div className="comm-post-header">
          <div>
            <span className="comm-post-autor">{post.nome} {post.sobrenome}</span>
            <span className="comm-post-tempo"> · {formatDistanceToNow(new Date(post.criado_em), { addSuffix: true, locale: ptBR })}</span>
          </div>
          <span className="comm-tag comm-tag-aprendizado">Aprendizado</span>
        </div>
        <h3 className="comm-post-titulo">{post.titulo}</h3>
        <p className="comm-post-texto">{post.conteudo}</p>
        <div className="comm-aprendizado-badge">
          <span>Idioma: {post.idioma}</span>
          <span>Quiz: {post.pontuacao_quiz}%</span>
        </div>
        <button className="comm-btn-ver" onClick={onAbrirModal}>
          Ver Explicação e Fazer Quiz
        </button>
        <div className="comm-post-footer">
          <span onClick={onLike} className={`comm-action ${post.curtiu ? "curtido" : ""}`} style={{ color: post.curtiu ? "#ef4444" : "inherit" }}>
            {post.curtiu ? "❤️" : "🤍"} {post.total_likes || 0}
          </span>
          <span onClick={onToggleComentario} className="comm-action">💬 {post.total_comentarios || 0}</span>
          <span onClick={onToggleComentario} className="comm-action">Comentar</span>

          {/* Botão de denúncia — só aparece se não for o próprio post */}
          {post.usuario_id !== usuarioLogadoId && (
            <span onClick={onDenunciar} className="comm-action comm-action-denuncia" title="Denunciar post">
              ⚑ Denunciar
            </span>
          )}
        </div>
        {comentarioAberto && (
          <div className="comm-comentarios-container">
            {comentariosLista.length > 0 && (
              <div className="comm-comentarios-lista">
                {comentariosLista.map((c) => (
                  <div key={c.id} className="comm-comentario-item">
                    <strong>{c.nome}:</strong> {c.conteudo}
                  </div>
                ))}
              </div>
            )}
            <ComentarioInput
              inicial={JSON.parse(localStorage.getItem("usuario") || "{}").nome?.charAt(0).toUpperCase()}
              texto={textoComentario}
              onChange={onChangeComentario}
              onEnviar={onEnviarComentario}
            />
          </div>
        )}
      </div>
    </article>
  );
}

// ── PostCard ───────────────────────────────────────────────────────
function PostCard({ post, usuarioLogadoId, onLike, comentarioAberto, onToggleComentario, textoComentario, onChangeComentario, onEnviarComentario, comentariosLista, onDenunciar }) {
  return (
    <article className="comm-post">
      <div className="comm-post-avatar" style={{ background: "linear-gradient(135deg,#4f46e5,#06b6d4)" }}>
        {post.nome?.charAt(0).toUpperCase()}
      </div>
      <div className="comm-post-body">
        <div className="comm-post-header">
          <div>
            <span className="comm-post-autor">{post.nome} {post.sobrenome}</span>
            <span className="comm-post-tempo"> · {formatDistanceToNow(new Date(post.criado_em), { addSuffix: true, locale: ptBR })}</span>
          </div>
          <span className="comm-tag">#{post.idioma}</span>
        </div>
        <h3 className="comm-post-titulo">{post.titulo}</h3>
        <p className="comm-post-texto">{post.conteudo}</p>
        <div className="comm-post-footer">
          <span onClick={onLike} className={`comm-action ${post.curtiu ? "curtido" : ""}`} style={{ color: post.curtiu ? "#ef4444" : "inherit" }}>
            {post.curtiu ? "❤️" : "🤍"} {post.total_likes || 0}
          </span>
          <span onClick={onToggleComentario} className="comm-action">💬 {post.total_comentarios || 0}</span>
          <span onClick={onToggleComentario} className="comm-action">Comentar</span>

          {/* Botão de denúncia — só aparece se não for o próprio post */}
          {post.usuario_id !== usuarioLogadoId && (
            <span onClick={onDenunciar} className="comm-action comm-action-denuncia" title="Denunciar post">
              ⚑ Denunciar
            </span>
          )}
        </div>
        {comentarioAberto && (
          <div className="comm-comentarios-container">
            {comentariosLista.length > 0 && (
              <div className="comm-comentarios-lista">
                {comentariosLista.map((c) => (
                  <div key={c.id} className="comm-comentario-item">
                    <strong>{c.nome}:</strong> {c.conteudo}
                  </div>
                ))}
              </div>
            )}
            <ComentarioInput
              inicial={JSON.parse(localStorage.getItem("usuario") || "{}").nome?.charAt(0).toUpperCase()}
              texto={textoComentario}
              onChange={onChangeComentario}
              onEnviar={onEnviarComentario}
            />
          </div>
        )}
      </div>
    </article>
  );
}

// ── ComentarioInput ────────────────────────────────────────────────
function ComentarioInput({ inicial, texto, onChange, onEnviar }) {
  return (
    <div className="comm-comentario">
      <div className="comm-comentario-avatar">{inicial}</div>
      <input
        placeholder="Escreva um comentário..."
        value={texto}
        onChange={onChange}
        onKeyDown={(e) => { if (e.key === "Enter") onEnviar(); }}
      />
      <button onClick={onEnviar}>Enviar</button>
    </div>
  );
}

export default Community;