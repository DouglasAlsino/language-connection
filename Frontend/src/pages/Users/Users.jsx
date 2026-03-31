import "./Users.css";
import { useState, useEffect } from "react";
import axios from "axios";

// Gera uma cor de avatar baseada no id do usuário
// Assim cada pessoa tem sempre a mesma cor, sem precisar salvar no banco
const CORES = [
  "linear-gradient(135deg,#4F46E5,#06B6D4)",
  "linear-gradient(135deg,#F59E0B,#EF4444)",
  "linear-gradient(135deg,#10B981,#3B82F6)",
  "linear-gradient(135deg,#8B5CF6,#EC4899)",
  "linear-gradient(135deg,#F97316,#FACC15)",
  "linear-gradient(135deg,#06B6D4,#22C55E)",
];

function getCorPorId(id) {
  return CORES[id % CORES.length];
}

function Users() {
  // Lista de usuários que vem da API
  const [usuarios, setUsuarios] = useState([]);

  // Controla se ainda está carregando os dados
  const [carregando, setCarregando] = useState(true);

  // Guarda mensagem de erro se a requisição falhar
  const [erro, setErro] = useState(null);

  const [filtros, setFiltros] = useState({
    idiomaAprender: "",
    nivel: "",
    idiomaNativo: "",
  });

  // useEffect com [] executa uma única vez quando a página carrega
  // É aqui que buscamos os usuários do backend
  useEffect(() => {
    const buscarUsuarios = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:3000/usuarios", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsuarios(response.data);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        setErro("Não foi possível carregar os usuários.");
      } finally {
        // Para o loading independente de sucesso ou erro
        setCarregando(false);
      }
    };

    buscarUsuarios();
  }, []);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setFiltros({ idiomaAprender: "", nivel: "", idiomaNativo: "" });
  };

  // Filtra os usuários vindos da API com base nos filtros selecionados
  const usuariosFiltrados = usuarios.filter((u) => {
    if (
      filtros.idiomaAprender &&
      !u.idiomas_aprender
        ?.toLowerCase()
        .includes(filtros.idiomaAprender.toLowerCase())
    )
      return false;
    if (
      filtros.idiomaNativo &&
      u.idioma_nativo?.toLowerCase() !== filtros.idiomaNativo.toLowerCase()
    )
      return false;
    if (filtros.nivel && u.nivel !== filtros.nivel) return false;
    return true;
  });

  return (
    <div className="lc-users-page">
      {/* Sidebar de filtros */}
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
          <label>Nível</label>
          <select
            name="nivel"
            value={filtros.nivel}
            onChange={handleFiltroChange}
          >
            <option value="">Selecione...</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
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

        <button className="lc-btn-primary" onClick={() => {}}>
          Aplicar filtros
        </button>
        <span className="lc-btn-link" onClick={limparFiltros}>
          Limpar filtros
        </span>
      </aside>

      {/* Área principal */}
      <main className="lc-users-content">
        <div className="lc-users-header">
          <h1>
            Resultados{" "}
            <span>({usuariosFiltrados.length} usuários)</span>
          </h1>
        </div>

        {/* Estado de carregamento */}
        {carregando && (
          <div className="lc-empty-state">
            <p>Carregando usuários...</p>
          </div>
        )}

        {/* Estado de erro */}
        {erro && (
          <div className="lc-empty-state">
            <p>{erro}</p>
          </div>
        )}

        {/* Grid de cards */}
        {!carregando && !erro && (
          <div className="lc-users-grid">
            {usuariosFiltrados.map((usuario) => (
              <UserCard key={usuario.id} usuario={usuario} />
            ))}
          </div>
        )}

        {/* Nenhum resultado */}
        {!carregando && !erro && usuariosFiltrados.length === 0 && (
          <div className="lc-empty-state">
            <p>Nenhum usuário encontrado com esses filtros.</p>
            <span onClick={limparFiltros}>Limpar filtros</span>
          </div>
        )}
      </main>
    </div>
  );
}

function UserCard({ usuario }) {
  const [conectado, setConectado] = useState(false);

  // Pega a inicial do nome para o avatar
  const inicial = usuario.nome?.charAt(0).toUpperCase() || "?";
  const cor = getCorPorId(usuario.id);

  // idiomas_aprender vem como string "Inglês,Espanhol"
  // split transforma em array ["Inglês", "Espanhol"] para exibir como tags
  const idiomasAprender = usuario.idiomas_aprender
    ? usuario.idiomas_aprender.split(",").map((i) => i.trim())
    : [];

  return (
    <div className="lc-user-card">
      <div className="lc-user-avatar" style={{ background: cor }}>
        {inicial}
      </div>

      <div className="lc-user-info">
        <h3>{usuario.nome} {usuario.sobrenome}</h3>
        <p className="lc-lang-row">
          <strong>Nativo:</strong> {usuario.idioma_nativo || "Não informado"}
        </p>
        <p className="lc-lang-row">
          <strong>Praticando:</strong>{" "}
          {idiomasAprender.length > 0
            ? idiomasAprender.join(", ")
            : "Não informado"}{" "}
          {usuario.nivel && `(${usuario.nivel})`}
        </p>
        {usuario.bio && (
          <p className="lc-lang-row">{usuario.bio}</p>
        )}
      </div>

      <div className="lc-user-actions">
        <button className="lc-btn-secondary">Ver perfil</button>
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