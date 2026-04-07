import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import "./Community.css";

// Sugestões de parceiros para o painel direito (ainda mockadas, pois não temos API para isso)
const SUGESTOES_MOCK = [
  {
    id: 1,
    nome: "Maria Hernández",
    inicial: "M",
    cor: "linear-gradient(135deg,#8B5CF6,#EC4899)",
    info: "Nativo: Espanhol · Pratica: Português",
  },
  {
    id: 2,
    nome: "Lucas Müller",
    inicial: "L",
    cor: "linear-gradient(135deg,#06B6D4,#22C55E)",
    info: "Nativo: Alemão · Pratica: Português",
  },
  {
    id: 3,
    nome: "Claire Dupont",
    inicial: "C",
    cor: "linear-gradient(135deg,#F97316,#FACC15)",
    info: "Nativo: Francês · Pratica: Inglês",
  },
];

function Community() {
  const [posts, setPosts] = useState([]);
  const [novoPostTitulo, setNovoPostTitulo] = useState("");
  const [novoPostConteudo, setNovoPostConteudo] = useState("");
  const [novoPostIdioma, setNovoPostIdioma] = useState("");
  const [carregandoPosts, setCarregandoPosts] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");

  const [comentarioAberto, setComentarioAberto] = useState(null);
  const [textoComentario, setTextoComentario] = useState("");
  const [likes, setLikes] = useState({});

  const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const token = localStorage.getItem("token");

  // ─── Função para buscar todos os posts ───────────────────────────
  const buscarPosts = async () => {
    // setCarregandoPosts(true); // Removido daqui para não mostrar "Carregando..." a cada 15s
    setErro("");
    try {
      const response = await axios.get("http://localhost:3000/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Otimização: só atualiza o estado se os dados realmente mudaram
      // Isso evita re-renderizações desnecessárias
      if (JSON.stringify(response.data) !== JSON.stringify(posts)) {
        setPosts(response.data);
        // Re-inicializa os likes para incluir novos posts, se necessário
        // Por enquanto, todos começam com 0 likes no frontend
        const initialLikes = response.data.reduce((acc, post) => ({ ...acc, [post.id]: 0 }), {});
        setLikes(initialLikes);
      }
    } catch (err) {
      console.error("Erro ao buscar posts:", err);
      setErro("Não foi possível carregar os posts. Tente novamente mais tarde.");
    } finally {
      setCarregandoPosts(false); // Garante que o estado de carregamento seja desativado
    }
  };

  // ─── Busca posts ao montar e configura o intervalo de atualização ──
  useEffect(() => {
    // Chama a função de busca imediatamente ao montar o componente
    buscarPosts();

    // Configura o intervalo para buscar posts a cada 15 segundos
    const intervalo = setInterval(buscarPosts, 15000); // 15000 ms = 15 segundos

    // Cleanup: Limpa o intervalo quando o componente desmonta
    // Essencial para evitar memory leaks e múltiplas chamadas
    return () => clearInterval(intervalo);
  }, []); // Array de dependências vazio para rodar apenas uma vez ao montar

  // ─── Função para criar um novo post ──────────────────────────────
  const criarPost = async (e) => {
    e.preventDefault();
    setErro("");

    if (!novoPostTitulo.trim() || !novoPostConteudo.trim() || !novoPostIdioma.trim()) {
      setErro("Por favor, preencha todos os campos (Título, Conteúdo e Idioma).");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/posts",
        {
          titulo: novoPostTitulo,
          conteudo: novoPostConteudo,
          idioma: novoPostIdioma,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Adiciona o novo post ao início da lista (otimista)
      // O backend já retorna o post completo com ID e data
      setPosts((prevPosts) => [
        {
          ...response.data.post,
          nome: usuarioLogado.nome, // Adiciona nome e sobrenome do usuário logado para exibição
          sobrenome: usuarioLogado.sobrenome,
        },
        ...prevPosts,
      ]);
      setNovoPostTitulo("");
      setNovoPostConteudo("");
      setNovoPostIdioma("");
      setLikes((prev) => ({ ...prev, [response.data.post.id]: 0 })); // Inicializa likes para o novo post
    } catch (err) {
      console.error("Erro ao criar post:", err);
      setErro("Não foi possível criar o post. Verifique se você está logado.");
    }
  };

  // ─── Funções de interação (likes, comentários) ───────────────────
  const toggleLike = (postId) => {
    setLikes((prev) => {
      const atual = prev[postId] ?? 0;
      const novo = atual === 0 ? 1 : 0; // Alterna entre 0 e 1 para simular like/deslike
      // Futuramente: enviar requisição para o backend para registrar o like
      return { ...prev, [postId]: novo };
    });
  };

  const toggleComentario = (postId) => {
    setComentarioAberto((prev) => (prev === postId ? null : postId));
    setTextoComentario("");
  };

  // ─── Filtro de posts ─────────────────────────────────────────────
  const postsFiltrados =
    filtroAtivo === "Todos"
      ? posts
      : posts.filter((p) =>
          p.idioma.toLowerCase().includes(filtroAtivo.toLowerCase())
        );

  // Chips de filtro disponíveis
  const filtros = [
    "Todos", "Português", "Inglês", "Espanhol",
    "Francês", "Alemão", "Japonês",
    // "Iniciantes", "Intermediário", // Estes filtros precisariam de um campo 'nivel' no post
  ];

  return (
    <div className="lc-community-page">

      {/* COLUNA ESQUERDA — filtros e grupos */}
      <aside className="lc-community-sidebar">
        <div className="lc-comm-card">
          <h2>Filtrar por idioma</h2>
          <div className="lc-chips">
            {filtros.map((filtro) => (
              <span
                key={filtro}
                className={`lc-chip ${filtroAtivo === filtro ? "active" : ""}`}
                onClick={() => setFiltroAtivo(filtro)}
              >
                {filtro}
              </span>
            ))}
          </div>
        </div>

        <div className="lc-comm-card">
          <h2>Grupos</h2>
          <div className="lc-chips">
            <span className="lc-chip">Inglês para viagens</span>
            <span className="lc-chip">Conversação em espanhol</span>
            <span className="lc-chip">Filmes em inglês</span>
          </div>
          <button className="lc-btn-outline-dashed">+ Criar novo grupo</button>
        </div>
      </aside>

      {/* COLUNA CENTRAL — feed de posts */}
      <main className="lc-community-feed">
        <h1 className="lc-feed-title">Comunidade</h1>

        {/* Card de criação de novo post */}
        <section className="lc-create-post">
          <div className="lc-post-avatar lc-avatar-me">
            {usuarioLogado.nome?.charAt(0).toUpperCase()}
          </div>

          <div className="lc-create-post-main">
            {erro && <p className="error-message">{erro}</p>}
            <input
              type="text"
              className="lc-post-input"
              placeholder="Título do seu post"
              value={novoPostTitulo}
              onChange={(e) => setNovoPostTitulo(e.target.value)}
              required
            />
            <textarea
              className="lc-post-textarea"
              placeholder="O que você gostaria de compartilhar?"
              value={novoPostConteudo}
              onChange={(e) => setNovoPostConteudo(e.target.value)}
              rows="3"
              required
            ></textarea>

            <div className="lc-create-post-footer">
              <select
                className="lc-select-lang"
                value={novoPostIdioma}
                onChange={(e) => setNovoPostIdioma(e.target.value)}
                required
              >
                <option value="">Selecione o idioma</option>
                <option value="Português">Português</option>
                <option value="Inglês">Inglês</option>
                <option value="Espanhol">Espanhol</option>
                <option value="Francês">Francês</option>
                <option value="Alemão">Alemão</option>
                <option value="Japonês">Japonês</option>
              </select>
              <button className="lc-btn-primary lc-btn-publish" onClick={criarPost}>
                Publicar
              </button>
            </div>
          </div>
        </section>

        {/* Lista de posts filtrados */}
        {carregandoPosts ? (
          <p className="loading-message">Carregando posts...</p>
        ) : postsFiltrados.length === 0 ? (
          <div className="lc-empty-state">
            <p>Nenhum post encontrado para esse filtro.</p>
            <span onClick={() => setFiltroAtivo("Todos")}>
              Ver todos os posts
            </span>
          </div>
        ) : (
          postsFiltrados.map((post) => (
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
          ))
        )}
      </main>

      {/* COLUNA DIREITA — sugestões e destaques */}
      <aside className="lc-community-right">
        <div className="lc-comm-card">
          <h3>Sugestões de parceiros</h3>
          {SUGESTOES_MOCK.map((s) => (
            <div key={s.id} className="lc-mini-user">
              <div
                className="lc-mini-avatar"
                style={{ background: s.cor }}
              >
                {s.inicial}
              </div>
              <div className="lc-mini-info">
                <strong>{s.nome}</strong>
                <span>{s.info}</span>
              </div>
            </div>
          ))}
          <span className="lc-side-link">Ver todos</span>
        </div>

        <div className="lc-comm-card">
          <h3>Em destaque</h3>
          <p className="lc-trend-item">
            <span>#Pronúncia</span> · 32 novos posts
          </p>
          <p className="lc-trend-item">
            <span>#InglêsParaViagem</span> · 18 novos posts
          </p>
          <p className="lc-trend-item">
            <span>#ExpressõesIdiomáticas</span> · 11 novos posts
          </p>
        </div>
      </aside>
    </div>
  );
}

// Componente PostCard
function PostCard({
  post,
  likes,
  onLike,
  comentarioAberto,
  onToggleComentario,
  textoComentario,
  onChangeComentario,
}) {
  return (
    <article className="lc-post-card">
      <div
        className="lc-post-avatar"
        style={{ background: "linear-gradient(135deg, #4f46e5, #06b6d4)" }} // Cor fixa para o avatar
      >
        {post.nome?.charAt(0).toUpperCase()}
      </div>

      <div className="lc-post-body">
        <div className="lc-post-header">
          <div>
            <span className="lc-post-author">
              {post.nome} {post.sobrenome}
            </span>
            <span className="lc-post-time">
              {" "}·{" "}
              {formatDistanceToNow(new Date(post.criado_em), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
          <span className="lc-post-tag">#{post.idioma}</span>
        </div>

        <h3 className="lc-post-title">{post.titulo}</h3>
        <p className="lc-post-text">{post.conteudo}</p>

        <div className="lc-post-footer">
          <span onClick={onLike} className="lc-post-action">
            ❤️ {likes}
          </span>

          <span onClick={onToggleComentario} className="lc-post-action">
            💬 {post.comentarios || 0} comentários
          </span>

          <span onClick={onToggleComentario} className="lc-post-action">
            Comentar
          </span>
        </div>

        {comentarioAberto && (
          <div className="lc-comment-input">
            <div className="lc-comment-avatar">
              {post.nome?.charAt(0).toUpperCase()}
            </div>

            <input
              placeholder="Escreva um comentário..."
              value={textoComentario}
              onChange={onChangeComentario}
            />

            <button
              onClick={() => {
                if (textoComentario.trim()) {
                  alert(`Comentário enviado: "${textoComentario}"`);
                }
              }}
            >
              Enviar
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default Community;