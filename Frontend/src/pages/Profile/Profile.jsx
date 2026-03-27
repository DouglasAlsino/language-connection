// Importa o CSS específico desta tela
import "./Profile.css";

// useState para controlar a aba ativa (Atividade, Conexões, Progresso)
// useParams para pegar o :id da URL quando ver perfil de outro usuário
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Dados simulados do perfil — futuramente virão de GET /usuarios/:id
// Quando o backend estiver pronto, substituímos por uma chamada à API
const PERFIL_MOCK = {
  id: 1,
  nome: "Douglas Guedes",
  usuario: "@douglasguedes",
  inicial: "D",
  cor: "linear-gradient(135deg, #4f46e5, #06b6d4)",
  bio: "Apaixonado por tecnologia e idiomas. Praticando inglês para intercâmbio. Adoro séries, tecnologia e viagens!",
  idiomaNativo: "Português",
  idiomas: [
    { nome: "Português", nivel: "C2", tipo: "Nativo", corBadge: "native" },
    { nome: "Inglês", nivel: "B1", tipo: "Aprendendo", corBadge: "b1" },
    { nome: "Espanhol", nivel: "A2", tipo: "Aprendendo", corBadge: "a2" },
  ],
  interesses: ["Tecnologia", "Séries", "Viagens", "Música", "Cinema"],
  stats: {
    conexoes: 12,
    posts: 34,
    meses: 6,
  },
};

// Atividades simuladas do usuário — futuramente: GET /posts?userId=1
const ATIVIDADES_MOCK = [
  {
    id: 1,
    tag: "#Inglês",
    tempo: "há 2 horas",
    texto:
      "Aprendi hoje a diferença entre 'make' e 'do' em inglês. 'Make' está ligado à criação e 'do' a ações. Alguém tem exemplos práticos?",
    likes: 8,
    comentarios: 3,
  },
  {
    id: 2,
    tag: "#Espanhol",
    tempo: "há 3 dias",
    texto:
      "Primera semana practicando español con Maria! Estoy muy feliz con el progreso. ¡Muchas gracias por la paciencia! 🎉",
    likes: 15,
    comentarios: 5,
  },
];

// Conexões simuladas — futuramente: GET /conexoes?userId=1
const CONEXOES_MOCK = [
  { id: 1, nome: "Maria H.", inicial: "M", cor: "linear-gradient(135deg,#8B5CF6,#EC4899)", idioma: "Espanhol" },
  { id: 2, nome: "Ana S.", inicial: "A", cor: "linear-gradient(135deg,#10B981,#3B82F6)", idioma: "Inglês" },
  { id: 3, nome: "James W.", inicial: "J", cor: "linear-gradient(135deg,#F97316,#FACC15)", idioma: "Inglês" },
  { id: 4, nome: "Lucas M.", inicial: "L", cor: "linear-gradient(135deg,#06B6D4,#22C55E)", idioma: "Alemão" },
  { id: 5, nome: "Yuki T.", inicial: "Y", cor: "linear-gradient(135deg,#F59E0B,#EF4444)", idioma: "Japonês" },
  { id: 6, nome: "Claire D.", inicial: "C", cor: "linear-gradient(135deg,#4F46E5,#EC4899)", idioma: "Francês" },
];

// Dados de progresso de aprendizado — futuramente: GET /progresso?userId=1
const PROGRESSO_MOCK = [
  { idioma: "Inglês (B1 → B2)", percentual: 68, cor: "linear-gradient(90deg,#4f46e5,#06b6d4)" },
  { idioma: "Espanhol (A1 → A2)", percentual: 42, cor: "linear-gradient(90deg,#10B981,#06B6D4)" },
  { idioma: "Sessões este mês", percentual: 75, cor: "linear-gradient(90deg,#F59E0B,#EF4444)", label: "9 / 12" },
];

function Perfil() {
  // useParams permite pegar o :id da URL se for /Perfil/2 por exemplo
  // Futuramente: se tiver id, busca o perfil daquele usuário; se não, mostra o logado
  const { id } = useParams();

  const navigate = useNavigate();

  // Aba ativa: "atividade", "conexoes" ou "progresso"
  const [abaAtiva, setAbaAtiva] = useState("atividade");

  // Controla se o modo de edição do perfil está ativo
  // Futuramente: abre um modal ou uma tela de edição
  const [editando, setEditando] = useState(false);

  // Por enquanto, sempre usa o PERFIL_MOCK
  // Futuramente: se id existir, busca da API; senão pega do contexto de autenticação
  const perfil = PERFIL_MOCK;

  return (
    <div className="lc-perfil-page">

      {/* COLUNA ESQUERDA — card do perfil + idiomas + interesses */}
      <aside className="lc-perfil-sidebar">

        {/* Card principal do perfil */}
        <div className="lc-perfil-card">

          {/* Capa colorida no topo do card */}
          <div className="lc-perfil-cover" />

          <div className="lc-perfil-card-body">

            {/* Avatar circular com inicial do nome */}
            <div
              className="lc-perfil-avatar"
              style={{ background: perfil.cor }}
            >
              {perfil.inicial}
            </div>

            {/* Nome e handle do usuário */}
            <div className="lc-perfil-nome">{perfil.nome}</div>
            <div className="lc-perfil-handle">{perfil.usuario}</div>

            {/* Badge do idioma nativo */}
            <div className="lc-perfil-badge">
              🇧🇷 Nativo em {perfil.idiomaNativo}
            </div>

            {/* Bio do usuário */}
            <p className="lc-perfil-bio">{perfil.bio}</p>

            {/* Estatísticas: conexões, posts, meses na plataforma */}
            <div className="lc-perfil-stats">
              <div className="lc-stat">
                <div className="lc-stat-num">{perfil.stats.conexoes}</div>
                <div className="lc-stat-label">Conexões</div>
              </div>
              <div className="lc-stat">
                <div className="lc-stat-num">{perfil.stats.posts}</div>
                <div className="lc-stat-label">Posts</div>
              </div>
              <div className="lc-stat">
                <div className="lc-stat-num">{perfil.stats.meses}</div>
                <div className="lc-stat-label">Meses</div>
              </div>
            </div>

            {/* Botões de ação
                Se id existir = perfil de outro usuário → mostra "Enviar mensagem"
                Se não = perfil próprio → mostra "Editar perfil" */}
            {id ? (
              // Vendo perfil de outro usuário
              <button
                className="lc-btn-message"
                onClick={() => navigate("/Chat")}
              >
                Enviar mensagem
              </button>
            ) : (
              // Vendo o próprio perfil
              <button
                className="lc-btn-edit"
                onClick={() => alert("Funcionalidade disponível em breve!")}
                >
                Editar perfil
            </button>
            )}

          </div>
        </div>

        {/* Card de idiomas do usuário */}
        <div className="lc-info-card">
          <div className="lc-info-card-title">Idiomas</div>

          {perfil.idiomas.map((idioma) => (
            <div key={idioma.nome} className="lc-idioma-item">
              <div className="lc-idioma-left">
                <span className="lc-idioma-nome">{idioma.nome}</span>
                <span className="lc-idioma-tipo">{idioma.tipo}</span>
              </div>
              {/* Badge colorido por nível */}
              <span className={`lc-nivel-badge lc-nivel-${idioma.corBadge}`}>
                {idioma.nivel}
              </span>
            </div>
          ))}
        </div>

        {/* Card de interesses do usuário */}
        <div className="lc-info-card">
          <div className="lc-info-card-title">Interesses</div>
          <div className="lc-tags">
            {perfil.interesses.map((tag) => (
              <span key={tag} className="lc-tag">{tag}</span>
            ))}
          </div>
        </div>

      </aside>

      {/* COLUNA PRINCIPAL — abas de conteúdo */}
      <main className="lc-perfil-main">

        {/* Navegação por abas */}
        <div className="lc-perfil-tabs">
          {["atividade", "conexoes", "progresso"].map((aba) => (
            <button
              key={aba}
              // Aplica classe "active" na aba selecionada
              className={`lc-tab-btn ${abaAtiva === aba ? "active" : ""}`}
              onClick={() => setAbaAtiva(aba)}
            >
              {/* Capitaliza o nome da aba para exibição */}
              {aba.charAt(0).toUpperCase() + aba.slice(1)}
            </button>
          ))}
        </div>

        {/* Conteúdo da aba ATIVIDADE */}
        {abaAtiva === "atividade" && (
          <div className="lc-aba-content">
            {ATIVIDADES_MOCK.map((atividade) => (
              <div key={atividade.id} className="lc-atividade-card">

                {/* Cabeçalho da atividade */}
                <div className="lc-atividade-header">
                  <div className="lc-atividade-info">
                    {/* Avatar do usuário logado */}
                    <div
                      className="lc-atividade-avatar"
                      style={{ background: perfil.cor }}
                    >
                      {perfil.inicial}
                    </div>
                    <div>
                      <div className="lc-atividade-nome">{perfil.nome}</div>
                      <div className="lc-atividade-tempo">{atividade.tempo}</div>
                    </div>
                  </div>
                  {/* Tag do idioma do post */}
                  <span className="lc-atividade-tag">{atividade.tag}</span>
                </div>

                {/* Texto do post de atividade */}
                <p className="lc-atividade-texto">{atividade.texto}</p>

                {/* Rodapé com likes e comentários */}
                <div className="lc-atividade-footer">
                  <span>❤️ {atividade.likes}</span>
                  <span>💬 {atividade.comentarios} comentários</span>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Conteúdo da aba CONEXÕES */}
        {abaAtiva === "conexoes" && (
          <div className="lc-aba-content">
            <div className="lc-conexoes-card">
              <h3>Conexões ({CONEXOES_MOCK.length})</h3>

              {/* Grid de conexões — 3 por linha */}
              <div className="lc-conexoes-grid">
                {CONEXOES_MOCK.map((conexao) => (
                  <div
                    key={conexao.id}
                    className="lc-conexao-item"
                    // Futuramente: navigate(`/Perfil/${conexao.id}`)
                    onClick={() => navigate("/Perfil")}
                  >
                    <div
                      className="lc-conexao-avatar"
                      style={{ background: conexao.cor }}
                    >
                      {conexao.inicial}
                    </div>
                    <div className="lc-conexao-nome">{conexao.nome}</div>
                    <div className="lc-conexao-idioma">{conexao.idioma}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo da aba PROGRESSO */}
        {abaAtiva === "progresso" && (
          <div className="lc-aba-content">
            <div className="lc-progresso-card">
              <h3>Progresso de aprendizado</h3>

              {PROGRESSO_MOCK.map((item) => (
                <div key={item.idioma} className="lc-progresso-item">

                  {/* Cabeçalho da barra: nome do idioma e percentual */}
                  <div className="lc-progresso-header">
                    <span>{item.idioma}</span>
                    {/* Se tiver label customizado usa ele, senão mostra percentual */}
                    <span>{item.label ?? `${item.percentual}%`}</span>
                  </div>

                  {/* Barra de progresso — largura controlada pelo percentual */}
                  <div className="lc-progresso-bg">
                    <div
                      className="lc-progresso-bar"
                      style={{
                        width: `${item.percentual}%`,
                        background: item.cor,
                      }}
                    />
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default Perfil;