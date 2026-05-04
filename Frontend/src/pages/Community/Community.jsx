import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import "./Community.css";
import AprendizadoModal from "../../components/AprendizadoModal/AprendizadoModal.jsx";

const SUGESTOES_MOCK = [
  { id: 1, nome: "Marina S.", inicial: "M", cor: "#8B5CF6", xp: 2840, posicao: 1 },
  { id: 2, nome: "Lucas P.",  inicial: "L", cor: "#06B6D4", xp: 2510, posicao: 2 },
  { id: 3, nome: "Ana R.",    inicial: "A", cor: "#10b981", xp: 2104, posicao: 3 },
];

const TRENDS = [
  { tag: "FuturoSimples", count: 124 },
  { tag: "DicaDoDia",     count: 98  },
  { tag: "Kanji",         count: 76  },
  { tag: "Pronúncia",     count: 54  },
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
  const [likes, setLikes] = useState({});
  const [postModalAberto, setPostModalAberto] = useState(null);

  const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const token = localStorage.getItem("token");

  const buscarPosts = async () => {
    setErro("");
    try {
      const response = await axios.get("http://localhost:3000/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (JSON.stringify(response.data) !== JSON.stringify(posts)) {
        setPosts(response.data);
        const initialLikes = response.data.reduce(
          (acc, post) => ({ ...acc, [post.id]: 0 }), {}
        );
        setLikes(initialLikes);
      }
    } catch (err) {
      setErro("Não foi possível carregar os posts.");
    } finally {
      setCarregandoPosts(false);
    }
  };

  useEffect(() => {
    buscarPosts();
    const intervalo = setInterval(buscarPosts, 15000);
    return () => clearInterval(intervalo);
  }, []);

  const criarPost = async (e) => {
    e.preventDefault();
    setErro("");
    if (!novoPostTitulo.trim() || !novoPostConteudo.trim() || !novoPostIdioma.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3000/posts",
        { titulo: novoPostTitulo, conteudo: novoPostConteudo, idioma: novoPostIdioma },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prev) => [
        { ...response.data.post, nome: usuarioLogado.nome, sobrenome: usuarioLogado.sobrenome },
        ...prev,
      ]);
      setNovoPostTitulo("");
      setNovoPostConteudo("");
      setNovoPostIdioma("");
      setLikes((prev) => ({ ...prev, [response.data.post.id]: 0 }));
    } catch (err) {
      setErro("Não foi possível criar o post.");
    }
  };

  const toggleLike = (postId) => {
    setLikes((prev) => ({ ...prev, [postId]: prev[postId] === 0 ? 1 : 0 }));
  };

  const toggleComentario = (postId) => {
    setComentarioAberto((prev) => (prev === postId ? null : postId));
    setTextoComentario("");
  };

  const postsFiltrados = posts
    .filter((p) => filtroAtivo === "Todos" || p.idioma?.toLowerCase().includes(filtroAtivo.toLowerCase()))
    .filter((p) => !busca.trim() || p.titulo?.toLowerCase().includes(busca.toLowerCase()) || p.conteudo?.toLowerCase().includes(busca.toLowerCase()));

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
            <div className="comm-card-title">
              <span>⚡</span> Filtrar por idioma
            </div>
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
            <div className="comm-card-title">
              <span>📈</span> Em alta
            </div>
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

          {/* Card de criar post */}
          <div className="comm-card comm-create">
            <div
              className="comm-create-avatar"
              style={{ background: "linear-gradient(135deg,#4f46e5,#06b6d4)" }}
            >
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

          {/* Tabs de ordenação + busca */}
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

          {/* Lista de posts */}
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
                  likes={likes[post.id] ?? 0}
                  onLike={() => toggleLike(post.id)}
                  comentarioAberto={comentarioAberto === post.id}
                  onToggleComentario={() => toggleComentario(post.id)}
                  textoComentario={textoComentario}
                  onChangeComentario={(e) => setTextoComentario(e.target.value)}
                  onAbrirModal={() => setPostModalAberto(post)}
                />
              ) : (
                <PostCard
                  key={post.id}
                  post={post}
                  likes={likes[post.id] ?? 0}
                  onLike={() => toggleLike(post.id)}
                  comentarioAberto={comentarioAberto === post.id}
                  onToggleComentario={() => toggleComentario(post.id)}
                  textoComentario={textoComentario}
                  onChangeComentario={(e) => setTextoComentario(e.target.value)}
                />
              )
            )
          )}
        </main>

        {/* COLUNA DIREITA */}
        <aside className="comm-right">

          {/* Top da semana */}
          <div className="comm-card comm-top-card">
            <div className="comm-top-header">
              <span>🏆</span>
              <div>
                <div className="comm-top-titulo">Top da semana</div>
                <div className="comm-top-sub">Os aprendizes mais ativos</div>
              </div>
            </div>
            {SUGESTOES_MOCK.map((s) => (
              <div key={s.id} className="comm-top-item">
                <span className="comm-top-pos">{s.posicao}</span>
                <div className="comm-top-avatar" style={{ background: s.cor }}>
                  {s.inicial}
                </div>
                <div className="comm-top-info">
                  <strong>{s.nome}</strong>
                  <span>{s.xp} XP</span>
                </div>
                <span className="comm-top-xp">🔥 {s.posicao === 1 ? 21 : s.posicao === 2 ? 15 : 12}</span>
              </div>
            ))}
          </div>

          {/* Sugestão de estudo */}
          <div className="comm-card">
            <div className="comm-card-title">
              <span>🎯</span> Sugestão de estudo
            </div>
            <p className="comm-sugestao-texto">
              Que tal revisar <strong>Pretérito Perfeito</strong> em Espanhol hoje?
            </p>
            <button className="comm-btn-iniciar">✦ Iniciar sessão</button>
          </div>

        </aside>
      </div>

      {postModalAberto && (
        <AprendizadoModal
          post={postModalAberto}
          onFechar={() => setPostModalAberto(null)}
        />
      )}
    </div>
  );
}

// ── PostAprendizadoCard ────────────────────────────────────────────────────
function PostAprendizadoCard({ post, likes, onLike, comentarioAberto, onToggleComentario, textoComentario, onChangeComentario, onAbrirModal }) {
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
          <span onClick={onLike} className="comm-action">❤️ {likes}</span>
          <span onClick={onToggleComentario} className="comm-action">💬 {post.comentarios || 0}</span>
          <span onClick={onToggleComentario} className="comm-action">Comentar</span>
        </div>
        {comentarioAberto && (
          <ComentarioInput
            inicial={post.nome?.charAt(0).toUpperCase()}
            texto={textoComentario}
            onChange={onChangeComentario}
          />
        )}
      </div>
    </article>
  );
}

// ── PostCard ───────────────────────────────────────────────────────────────
function PostCard({ post, likes, onLike, comentarioAberto, onToggleComentario, textoComentario, onChangeComentario }) {
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
          <span onClick={onLike} className="comm-action">❤️ {likes}</span>
          <span onClick={onToggleComentario} className="comm-action">💬 {post.comentarios || 0}</span>
          <span onClick={onToggleComentario} className="comm-action">Comentar</span>
        </div>
        {comentarioAberto && (
          <ComentarioInput
            inicial={post.nome?.charAt(0).toUpperCase()}
            texto={textoComentario}
            onChange={onChangeComentario}
          />
        )}
      </div>
    </article>
  );
}

// ── ComentarioInput ────────────────────────────────────────────────────────
function ComentarioInput({ inicial, texto, onChange }) {
  return (
    <div className="comm-comentario">
      <div className="comm-comentario-avatar">{inicial}</div>
      <input
        placeholder="Escreva um comentário..."
        value={texto}
        onChange={onChange}
      />
      <button onClick={() => texto.trim() && alert(`Comentário: "${texto}"`)}>
        Enviar
      </button>
    </div>
  );
}
