import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PerfilUsuario.css";

function PerfilUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [conexoes, setConexoes] = useState([]);
  const [statusConexao, setStatusConexao] = useState("nenhuma");
  const [abaAtiva, setAbaAtiva] = useState("atividade");
  const [carregando, setCarregando] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    buscarPerfil();
    buscarStatusConexao();
    buscarConexoes();
  }, [id]);

  async function buscarPerfil() {
    try {
      const response = await axios.get(`http://localhost:3000/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPerfil(response.data);
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function buscarConexoes() {
    try {
      const response = await axios.get(
        `http://localhost:3000/conexoes/aceitas/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConexoes(response.data);
    } catch (error) {
      console.error("Erro ao buscar conexões:", error);
    }
  }

  async function buscarStatusConexao() {
    try {
      const response = await axios.get(
        `http://localhost:3000/conexoes/status/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatusConexao(response.data.status);
    } catch (error) {
      console.error("Erro ao buscar status da conexão:", error);
    }
  }

  async function enviarSolicitacao() {
    try {
      await axios.post(
        "http://localhost:3000/conexoes",
        { receptor_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatusConexao("pendente");
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
    }
  }

  const [desconectando, setDesconectando] = useState(false);

async function desconectar() {
  try {
    setDesconectando(true);
    await axios.delete(`http://localhost:3000/conexoes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStatusConexao("nenhuma");
    // Atualiza a lista de conexões após desconectar
    setConexoes((prev) => prev.filter((c) => c.id !== Number(id)));
  } catch (error) {
    console.error("Erro ao desconectar:", error);
  } finally {
    setDesconectando(false);
  }
}

function renderizarBotao() {
  if (statusConexao === "aceita") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button className="lc-btn-message" onClick={() => navigate("/chat")}>
          Enviar mensagem
        </button>
        <button
          className="lc-btn-desconectar"
          onClick={desconectar}
          disabled={desconectando}
        >
          {desconectando ? "Removendo..." : "Desconectar"}
        </button>
      </div>
    );
  }
  if (statusConexao === "pendente") {
    return (
      <button className="lc-btn-pendente" disabled>
        Solicitação pendente
      </button>
    );
  }
  return (
    <button className="lc-btn-conectar" onClick={enviarSolicitacao}>
      Conectar
    </button>
  );
}

  if (carregando) return <div className="lc-carregando">Carregando perfil...</div>;
  if (!perfil) return <div className="lc-carregando">Usuário não encontrado.</div>;

  const meses = perfil.criado_em
    ? Math.max(1, Math.floor(
        (new Date() - new Date(perfil.criado_em)) / (1000 * 60 * 60 * 24 * 30)
      ))
    : 1;

  return (
    <div className="lc-perfil-page">
      <aside className="lc-perfil-sidebar">
        <div className="lc-perfil-card">
          <div className="lc-perfil-cover" />
          <div className="lc-perfil-card-body">

            <div className="lc-perfil-avatar" style={{ background: "linear-gradient(135deg, #4f46e5, #06b6d4)" }}>
              {perfil.nome?.charAt(0).toUpperCase()}
            </div>

            <div className="lc-perfil-nome">{perfil.nome} {perfil.sobrenome}</div>
            <div className="lc-perfil-handle">@{perfil.nome?.toLowerCase()}{perfil.sobrenome?.toLowerCase()}</div>

            <div className="lc-perfil-badge">
              🌐 Nativo em {perfil.idioma_nativo}
            </div>

            <p className="lc-perfil-bio">{perfil.bio || "Este usuário ainda não adicionou uma bio."}</p>

            <div className="lc-perfil-stats">
              <div className="lc-stat">
                <div className="lc-stat-num">{conexoes.length}</div>
                <div className="lc-stat-label">Conexões</div>
              </div>
              <div className="lc-stat">
                <div className="lc-stat-num">0</div>
                <div className="lc-stat-label">Posts</div>
              </div>
              <div className="lc-stat">
                <div className="lc-stat-num">{meses}</div>
                <div className="lc-stat-label">Meses</div>
              </div>
            </div>

            {renderizarBotao()}
          </div>
        </div>

        <div className="lc-info-card">
          <div className="lc-info-card-title">Idiomas para aprender</div>
          {perfil.idiomas_aprender ? (
            perfil.idiomas_aprender.split(",").map((idioma) => (
              <div key={idioma} className="lc-idioma-item">
                <div className="lc-idioma-left">
                  <span className="lc-idioma-nome">{idioma.trim()}</span>
                  <span className="lc-idioma-tipo">Aprendendo</span>
                </div>
                <span className={`lc-nivel-badge lc-nivel-${perfil.nivel?.toLowerCase()}`}>
                  {perfil.nivel}
                </span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 13, color: "#9ca3af" }}>Nenhum idioma cadastrado.</p>
          )}
        </div>
      </aside>

      <main className="lc-perfil-main">
        <div className="lc-perfil-tabs">
          {["atividade", "conexoes", "progresso"].map((aba) => (
            <button
              key={aba}
              className={`lc-tab-btn ${abaAtiva === aba ? "active" : ""}`}
              onClick={() => setAbaAtiva(aba)}
            >
              {aba.charAt(0).toUpperCase() + aba.slice(1)}
            </button>
          ))}
        </div>

        {abaAtiva === "atividade" && (
          <div className="lc-aba-content">
            <div className="lc-atividade-card">
              <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center" }}>
                Nenhuma atividade ainda.
              </p>
            </div>
          </div>
        )}

        {abaAtiva === "conexoes" && (
          <div className="lc-aba-content">
            <div className="lc-conexoes-card">
              <h3>Conexões ({conexoes.length})</h3>
              {conexoes.length === 0 ? (
                <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", padding: "32px 0" }}>
                  Nenhuma conexão ainda.
                </p>
              ) : (
                <div className="lc-conexoes-grid">
                  {conexoes.map((conexao) => {
                    const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "{}");
                    const ehProprioUsuario = conexao.id === usuarioLogado.id;

                    return (
                      <div
                        key={conexao.id}
                        className="lc-conexao-item"
                        onClick={() =>
                          ehProprioUsuario
                            ? navigate("/Perfil")
                            : navigate(`/usuarios/${conexao.id}`)
                        }
                      >
                        <div className="lc-conexao-avatar">
                          {conexao.nome?.charAt(0).toUpperCase()}
                        </div>
                        <div className="lc-conexao-nome">
                          {conexao.nome} {conexao.sobrenome}
                        </div>
                        <div className="lc-conexao-idioma">{conexao.idioma_nativo}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {abaAtiva === "progresso" && (
          <div className="lc-aba-content">
            <div className="lc-progresso-card">
              <h3>Progresso de aprendizado</h3>
              <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", padding: "32px 0" }}>
                Em breve.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PerfilUsuario;