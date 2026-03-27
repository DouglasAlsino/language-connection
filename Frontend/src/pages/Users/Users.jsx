import "./Users.css";
// useState para controlar os filtros selecionados
// e a lista de usuários exibida
import { useState } from "react";

// Dados simulados de usuários — depois virão da API real
// Isso permite desenvolver e testar o frontend independentemente do backend
const USUARIOS_MOCK = [
  {
    id: 1,
    nome: "Maria Hernández",
    idiomaNativo: "Espanhol",
    nivelNativo: "C2",
    idiomaAprendendo: "Português",
    nivelAprendendo: "A2",
    interesses: ["Séries", "Viagens", "Música"],
    online: true,
    inicial: "M",
    cor: "linear-gradient(135deg,#4F46E5,#06B6D4)",
  },
  {
    id: 2,
    nome: "James Williams",
    idiomaNativo: "Inglês",
    nivelNativo: "C2",
    idiomaAprendendo: "Português",
    nivelAprendendo: "B1",
    interesses: ["Tecnologia", "Esportes"],
    online: true,
    inicial: "J",
    cor: "linear-gradient(135deg,#F59E0B,#EF4444)",
  },
  {
    id: 3,
    nome: "Ana Silva",
    idiomaNativo: "Português",
    nivelNativo: "C2",
    idiomaAprendendo: "Inglês",
    nivelAprendendo: "B2",
    interesses: ["Livros", "Cinema", "Culinária"],
    online: false,
    inicial: "A",
    cor: "linear-gradient(135deg,#10B981,#3B82F6)",
  },
  {
    id: 4,
    nome: "Yuki Tanaka",
    idiomaNativo: "Japonês",
    nivelNativo: "C2",
    idiomaAprendendo: "Português",
    nivelAprendendo: "A1",
    interesses: ["Anime", "Jogos"],
    online: true,
    inicial: "Y",
    cor: "linear-gradient(135deg,#8B5CF6,#EC4899)",
  },
  {
    id: 5,
    nome: "Claire Dupont",
    idiomaNativo: "Francês",
    nivelNativo: "C2",
    idiomaAprendendo: "Português",
    nivelAprendendo: "B1",
    interesses: ["Arte", "Moda", "Fotografia"],
    online: false,
    inicial: "C",
    cor: "linear-gradient(135deg,#F97316,#FACC15)",
  },
  {
    id: 6,
    nome: "Lucas Müller",
    idiomaNativo: "Alemão",
    nivelNativo: "C1",
    idiomaAprendendo: "Português",
    nivelAprendendo: "A2",
    interesses: ["Engenharia", "Ciclismo"],
    online: true,
    inicial: "L",
    cor: "linear-gradient(135deg,#06B6D4,#22C55E)",
  },
];

function Users() {
  // Estado dos filtros — controla o que o usuário selecionou
  const [filtros, setFiltros] = useState({
    idiomaAprender: "",
    nivel: "",
    idiomaNativo: "",
    apenasOnline: false,
  });

  // Atualiza filtros quando o usuário altera os selects
  const handleFiltroChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros((prev) => ({
      ...prev,
      // Para checkbox usa "checked", para selects usa "value"
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Filtra a lista de usuários baseado nos filtros selecionados
  // Essa lógica roda no frontend — futuramente pode ir para o backend
  const usuariosFiltrados = USUARIOS_MOCK.filter((u) => {
    if (filtros.idiomaAprender && u.idiomaAprendendo !== filtros.idiomaAprender)
      return false;
    if (filtros.idiomaNativo && u.idiomaNativo !== filtros.idiomaNativo)
      return false;
    if (filtros.apenasOnline && !u.online)
      return false;
    return true;
  });

  // Limpa todos os filtros de uma vez
  const limparFiltros = () => {
    setFiltros({
      idiomaAprender: "",
      nivel: "",
      idiomaNativo: "",
      apenasOnline: false,
    });
  };

  return (
    // padding-top compensa a Navbar fixa de 72px
    <div className="lc-users-page">

      {/* Sidebar de filtros — coluna esquerda */}
      <aside className="lc-users-sidebar">
        <h2>Encontrar parceiros</h2>

        <div className="lc-filter-group">
          <label>Idioma que quero praticar</label>
          <select
            name="idiomaAprender"
            value={filtros.idiomaAprender}
            onChange={handleFiltroChange}
          >
            <option value="">Selecione...</option>
            <option>Inglês</option>
            <option>Espanhol</option>
            <option>Francês</option>
            <option>Alemão</option>
            <option>Japonês</option>
            <option>Português</option>
          </select>
        </div>

        <div className="lc-filter-group">
          <label>Meu nível</label>
          <select
            name="nivel"
            value={filtros.nivel}
            onChange={handleFiltroChange}
          >
            <option value="">Selecione...</option>
            <option>Iniciante (A1/A2)</option>
            <option>Intermediário (B1/B2)</option>
            <option>Avançado (C1/C2)</option>
          </select>
        </div>

        <div className="lc-filter-group">
          <label>Idioma nativo do parceiro</label>
          <select
            name="idiomaNativo"
            value={filtros.idiomaNativo}
            onChange={handleFiltroChange}
          >
            <option value="">Qualquer</option>
            <option>Inglês</option>
            <option>Espanhol</option>
            <option>Francês</option>
            <option>Alemão</option>
            <option>Japonês</option>
            <option>Português</option>
          </select>
        </div>

        {/* Checkbox para mostrar só quem está online */}
        <div className="lc-checkbox-group">
          <input
            type="checkbox"
            id="apenasOnline"
            name="apenasOnline"
            checked={filtros.apenasOnline}
            onChange={handleFiltroChange}
          />
          <label htmlFor="apenasOnline">Mostrar apenas quem está online</label>
        </div>

        <button className="lc-btn-primary" onClick={() => {}}>
          Aplicar filtros
        </button>

        {/* Botão para resetar todos os filtros */}
        <span className="lc-btn-link" onClick={limparFiltros}>
          Limpar filtros
        </span>
      </aside>

      {/* Área principal — lista de usuários */}
      <main className="lc-users-content">
        <div className="lc-users-header">
          <h1>
            Resultados{" "}
            <span>({usuariosFiltrados.length} usuários)</span>
          </h1>
        </div>

        {/* Grid de UserCards */}
        <div className="lc-users-grid">
          {usuariosFiltrados.map((usuario) => (
            // Cada usuário vira um card — key obrigatório em listas React
            <UserCard key={usuario.id} usuario={usuario} />
          ))}
        </div>

        {/* Mensagem quando nenhum usuário passou pelos filtros */}
        {usuariosFiltrados.length === 0 && (
          <div className="lc-empty-state">
            <p>Nenhum usuário encontrado com esses filtros.</p>
            <span onClick={limparFiltros}>Limpar filtros</span>
          </div>
        )}
      </main>
    </div>
  );
}

// Componente interno UserCard — recebe os dados de um usuário via props
// Separar em componente facilita reutilização e leitura do código
function UserCard({ usuario }) {
  // Estado local para controlar o botão "Conectar"
  // Depois vamos ligar isso ao backend (POST /conexoes)
  const [conectado, setConectado] = useState(false);

  return (
    <div className="lc-user-card">

      {/* Avatar circular com cor única por usuário */}
      <div
        className="lc-user-avatar"
        style={{ background: usuario.cor }}
      >
        {usuario.inicial}
      </div>

      {/* Informações do usuário */}
      <div className="lc-user-info">
        <h3>{usuario.nome}</h3>
        <p className="lc-lang-row">
          <strong>Nativo:</strong> {usuario.idiomaNativo} ({usuario.nivelNativo})
        </p>
        <p className="lc-lang-row">
          <strong>Praticando:</strong> {usuario.idiomaAprendendo} (
          {usuario.nivelAprendendo})
        </p>
        {/* Tags de interesses do usuário */}
        <div className="lc-tags">
          {usuario.interesses.map((tag) => (
            <span key={tag} className="lc-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Ações do card — status, botões */}
      <div className="lc-user-actions">
        {/* Indicador de status online/offline */}
        <div className={`lc-status ${usuario.online ? "online" : "offline"}`}>
          <div className="lc-status-dot"></div>
          <span>{usuario.online ? "Online" : "Offline"}</span>
        </div>

        <button className="lc-btn-secondary">Ver perfil</button>

        {/* Botão de conectar — muda de visual após clique */}
        <button
          className={`lc-btn-connect ${conectado ? "conectado" : ""}`}
          onClick={() => setConectado(!conectado)}
        >
          {conectado ? "Conectado ✓" : "Conectar"}
        </button>
      </div>
    </div>
  );
}

export default Users;