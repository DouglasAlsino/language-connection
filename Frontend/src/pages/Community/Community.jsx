// Importa o CSS específico desta tela
import "./Community.css";

// useState para controlar posts, novo post, filtros e comentários
import { useState } from "react";

// Dados simulados de posts — futuramente virão de GET /posts
const POSTS_MOCK = [
  {
    id: 1,
    autor: "Ana Silva",
    inicial: "A",
    cor: "linear-gradient(135deg,#10B981,#3B82F6)",
    tempo: "há 2 horas",
    idioma: "#Inglês",
    texto:
      "Hoje aprendi a diferença entre 'say' e 'tell'. Alguém tem dicas de exemplos práticos para memorizar melhor?",
    likes: 12,
    comentarios: 4,
  },
  {
    id: 2,
    autor: "James Williams",
    inicial: "J",
    cor: "linear-gradient(135deg,#F97316,#FACC15)",
    tempo: "há 5 horas",
    idioma: "#Português",
    texto:
      "Pessoal, qual a diferença entre 'saudade' e 'nostalgia' em português? Exemplos são bem-vindos!",
    likes: 23,
    comentarios: 8,
  },
  {
    id: 3,
    autor: "Yuki Tanaka",
    inicial: "Y",
    cor: "linear-gradient(135deg,#8B5CF6,#EC4899)",
    tempo: "há 1 dia",
    idioma: "#Japonês",
    texto:
      "Alguém mais estuda japonês aqui? Estou tentando aprender hiragana e adoraria trocar dicas!",
    likes: 9,
    comentarios: 2,
  },
];

// Sugestões de parceiros para o painel direito
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
  // Lista de posts — inicia com dados mockados
  // Futuramente: buscar de GET /posts
  const [posts, setPosts] = useState(POSTS_MOCK);

  // Texto digitado na área de criação de novo post
  const [novoPost, setNovoPost] = useState("");

  // Idioma selecionado para o novo post
  const [idiomaPost, setIdiomaPost] = useState("Inglês");

  // Filtro de idioma ativo na sidebar esquerda
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");

  // Controla qual post está com a área de comentário aberta
  // Guarda o ID do post — null = nenhum aberto
  const [comentarioAberto, setComentarioAberto] = useState(null);

  // Texto digitado no campo de comentário
  const [textoComentario, setTextoComentario] = useState("");

  // Controla os likes de cada post localmente
  // Usa um objeto onde a chave é o ID do post
  const [likes, setLikes] = useState(
    POSTS_MOCK.reduce((acc, post) => ({ ...acc, [post.id]: post.likes }), {})
  );

  // Publica um novo post na comunidade
  const publicarPost = (e) => {
    e.preventDefault();

    // Não publica se o campo estiver vazio
    if (!novoPost.trim()) return;

    // Cria objeto do novo post com dados do usuário logado (por ora, fixo)
    // Futuramente: await api.post("/posts", { texto: novoPost, idioma: idiomaPost })
    const post = {
      id: posts.length + 1,
      autor: "Douglas",
      inicial: "D",
      cor: "linear-gradient(135deg,#4F46E5,#06B6D4)",
      tempo: "agora mesmo",
      idioma: `#${idiomaPost}`,
      texto: novoPost,
      likes: 0,
      comentarios: 0,
    };

    // Adiciona o novo post no topo da lista
    setPosts((prev) => [post, ...prev]);

    // Inicializa o contador de likes do novo post
    setLikes((prev) => ({ ...prev, [post.id]: 0 }));

    // Limpa o campo de texto
    setNovoPost("");
  };

  // Alterna o like de um post
  // Se já curtiu, remove; se não curtiu, adiciona
  const toggleLike = (postId) => {
  setLikes((prev) => {
    const atual = prev[postId] ?? 0;
    const novo = atual === 0 ? 1 : 0; // 0 → 1 → 0 → 1 ...
    return { ...prev, [postId]: novo };
  });
};

  // Abre ou fecha a área de comentário de um post
  const toggleComentario = (postId) => {
    setComentarioAberto((prev) => (prev === postId ? null : postId));
    setTextoComentario(""); // limpa o campo ao abrir/fechar
  };

  // Filtra os posts pelo idioma selecionado na sidebar
  const postsFiltrados =
    filtroAtivo === "Todos"
      ? posts
      : posts.filter((p) =>
          p.idioma.toLowerCase().includes(filtroAtivo.toLowerCase())
        );

  // Chips de filtro disponíveis
  const filtros = [
    "Todos", "Inglês", "Espanhol",
    "Francês", "Alemão", "Japonês",
    "Iniciantes", "Intermediário",
  ];

  return (
    // Container principal com padding-top para compensar a Navbar fixa
    <div className="lc-community-page">

      {/* COLUNA ESQUERDA — filtros e grupos */}
      <aside className="lc-community-sidebar">

        {/* Card de filtros por idioma */}
        <div className="lc-comm-card">
          <h2>Filtrar por idioma</h2>
          <div className="lc-chips">
            {filtros.map((filtro) => (
              <span
                key={filtro}
                // Aplica classe "active" no filtro selecionado
                className={`lc-chip ${filtroAtivo === filtro ? "active" : ""}`}
                onClick={() => setFiltroAtivo(filtro)}
              >
                {filtro}
              </span>
            ))}
          </div>
        </div>

        {/* Card de grupos temáticos */}
        <div className="lc-comm-card">
          <h2>Grupos</h2>
          <div className="lc-chips">
            <span className="lc-chip">Inglês para viagens</span>
            <span className="lc-chip">Conversação em espanhol</span>
            <span className="lc-chip">Filmes em inglês</span>
          </div>
          {/* Botão de criar grupo — futuramente abre um modal */}
          <button className="lc-btn-outline-dashed">+ Criar novo grupo</button>
        </div>

      </aside>

      {/* COLUNA CENTRAL — feed de posts */}
      <main className="lc-community-feed">
        <h1 className="lc-feed-title">Comunidade</h1>

        {/* Card de criação de novo post */}
        <section className="lc-create-post">
          {/* Avatar do usuário logado */}
          <div className="lc-post-avatar lc-avatar-me">D</div>

          <div className="lc-create-post-main">
            {/* Textarea controlada pelo estado novoPost */}
            <textarea
              className="lc-post-textarea"
              placeholder="Compartilhe uma dica, dúvida ou frase no seu idioma alvo..."
              value={novoPost}
              onChange={(e) => setNovoPost(e.target.value)}
            />

            {/* Rodapé da criação: seletor de idioma + botão publicar */}
            <div className="lc-create-post-footer">
              <select
                className="lc-select-lang"
                value={idiomaPost}
                onChange={(e) => setIdiomaPost(e.target.value)}
              >
                <option>Inglês</option>
                <option>Espanhol</option>
                <option>Português</option>
                <option>Francês</option>
                <option>Alemão</option>
                <option>Japonês</option>
              </select>
              <button className="lc-btn-primary lc-btn-publish" onClick={publicarPost}>
              Publicar
            </button>
            </div>
          </div>
        </section>

        {/* Lista de posts filtrados */}
        {postsFiltrados.length === 0 ? (
          // Estado vazio quando nenhum post bate no filtro
          <div className="lc-empty-state">
            <p>Nenhum post encontrado para esse filtro.</p>
            <span onClick={() => setFiltroAtivo("Todos")}>
              Ver todos os posts
            </span>
          </div>
        ) : (
          postsFiltrados.map((post) => (
            // Cada post vira um PostCard
            <PostCard
              key={post.id}
              post={post}
              likes={likes[post.id] ?? post.likes}
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

        {/* Sugestões de parceiros de prática */}
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

        {/* Posts em destaque da semana */}
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

// Componente PostCard — separado para manter o código organizado e legível
// Recebe os dados do post e as funções de interação via props
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

      {/* Avatar do autor do post */}
      <div
        className="lc-post-avatar"
        style={{ background: post.cor }}
      >
        {post.inicial}
      </div>

      <div className="lc-post-body">

        {/* Cabeçalho do post: autor, tempo e tag de idioma */}
        <div className="lc-post-header">
          <div>
            <span className="lc-post-author">{post.autor}</span>
            <span className="lc-post-time"> · {post.tempo}</span>
          </div>
          <span className="lc-post-tag">{post.idioma}</span>
        </div>

        {/* Texto do post */}
        <p className="lc-post-text">{post.texto}</p>

        {/* Rodapé com likes e comentários */}
        <div className="lc-post-footer">
          {/* Botão de like — chama onLike ao clicar */}
          <span onClick={onLike} className="lc-post-action">
            ❤️ {likes}
          </span>

          {/* Botão de comentário — abre/fecha o input abaixo */}
          <span onClick={onToggleComentario} className="lc-post-action">
            💬 {post.comentarios} comentários
          </span>

          <span onClick={onToggleComentario} className="lc-post-action">
            Comentar
          </span>
        </div>

        {/* Área de comentário — visível apenas quando comentarioAberto === true */}
        {comentarioAberto && (
          <div className="lc-comment-input">
            {/* Avatar do usuário logado */}
            <div className="lc-comment-avatar">D</div>

            {/* Input de texto do comentário */}
            <input
              placeholder="Escreva um comentário..."
              value={textoComentario}
              onChange={onChangeComentario}
            />

            {/* Botão de envio do comentário
                Futuramente: await api.post("/comentarios", { postId, texto }) */}
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