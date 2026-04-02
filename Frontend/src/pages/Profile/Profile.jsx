import "./Profile.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function Perfil() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [conexoes, setConexoes] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("atividade");
  const [carregando, setCarregando] = useState(true);

  const token = localStorage.getItem("token");
  const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "{}");

  // Decide qual ID buscar: se tem :id na URL, é perfil de outro; senão é o próprio
  const idAlvo = id || usuarioLogado.id;

  useEffect(() => {
    const buscarPerfil = async () => {
      try {
        setCarregando(true);

        // Busca dados do usuário
        const resPerfil = await axios.get(
          `http://localhost:3000/usuarios/${idAlvo}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Busca conexões aceitas do usuário
        const resConexoes = await axios.get(
          `http://localhost:3000/conexoes/aceitas/${idAlvo}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setPerfil(resPerfil.data);
        setConexoes(resConexoes.data);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setCarregando(false);
      }
    };

    buscarPerfil();
  }, [idAlvo]);

  if (carregando) {
    return <div className="lc-perfil-loading">Carregando perfil...</div>;
  }

  if (!perfil) {
    return <div className="lc-perfil-loading">Usuário não encontrado.</div>;
  }

  const inicial = perfil.nome?.charAt(0).toUpperCase() || "U";
  const nomeCompleto = `${perfil.nome} ${perfil.sobrenome}`;
  const isProprioPeril = !id || parseInt(id) === usuarioLogado.id;

  return (
    <div className="lc-perfil-page">

      {/* COLUNA ESQUERDA */}
      <aside className="lc-perfil-sidebar">
        <div className="lc-perfil-card">
          <div className="lc-perfil-cover" />
          <div className="lc-perfil-card-body">

            <div className="lc-perfil-avatar" style={{ background: "linear-gradient(135deg, #4f46e5, #06b6d4)" }}>
              {inicial}
            </div>

            <div className="lc-perfil-nome">{nomeCompleto}</div>
            <div className="lc-perfil-handle">@{perfil.nome?.toLowerCase()}{perfil.sobrenome?.toLowerCase()}</div>

            <div className="lc-perfil-badge">
              🌐 Nativo em {perfil.idioma_nativo}
            </div>

            <p className="lc-perfil-bio">{perfil.bio || "Sem bio ainda."}</p>

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
                <div className="lc-stat-num">
                  {perfil.criado_em
                  ? Math.max(1, Math.floor(
                   (new Date() - new Date(perfil.criado_em)) / (1000 * 60 * 60 * 24 * 30)
                   ))
                   : 1}
               </div>
                <div className="lc-stat-label">Meses</div>
              </div>
            </div>

            {isProprioPeril ? (
              <button
                className="lc-btn-edit"
                onClick={() => alert("Funcionalidade disponível em breve!")}
              >
                Editar perfil
              </button>
            ) : (
              <button
                className="lc-btn-message"
                onClick={() => navigate("/Chat")}
              >
                Enviar mensagem
              </button>
            )}

          </div>
        </div>

        {/* Card de idiomas */}
        <div className="lc-info-card">
          <div className="lc-info-card-title">Idiomas</div>
          <div className="lc-idioma-item">
            <div className="lc-idioma-left">
              <span className="lc-idioma-nome">{perfil.idioma_nativo}</span>
              <span className="lc-idioma-tipo">Nativo</span>
            </div>
            <span className="lc-nivel-badge lc-nivel-native">C2</span>
          </div>
          {perfil.idiomas_aprender && (
            <div className="lc-idioma-item">
              <div className="lc-idioma-left">
                <span className="lc-idioma-nome">{perfil.idiomas_aprender}</span>
                <span className="lc-idioma-tipo">Aprendendo</span>
              </div>
              <span className={`lc-nivel-badge lc-nivel-${perfil.nivel?.toLowerCase() || "a1"}`}>
                {perfil.nivel || "A1"}
              </span>
            </div>
          )}
        </div>

        {/* Card de interesses */}
        {perfil.bio && (
          <div className="lc-info-card">
            <div className="lc-info-card-title">Sobre</div>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>{perfil.bio}</p>
          </div>
        )}

      </aside>

      {/* COLUNA PRINCIPAL */}
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

        {/* Aba ATIVIDADE */}
        {abaAtiva === "atividade" && (
          <div className="lc-aba-content">
            <div className="lc-atividade-card">
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "32px 0" }}>
                Nenhuma atividade ainda.
              </p>
            </div>
          </div>
        )}

        {/* Aba CONEXÕES */}
        {abaAtiva === "conexoes" && (
          <div className="lc-aba-content">
            <div className="lc-conexoes-card">
              <h3>Conexões ({conexoes.length})</h3>
              {conexoes.length === 0 ? (
                <p style={{ color: "#94a3b8", textAlign: "center", padding: "32px 0" }}>
                  Nenhuma conexão ainda.
                </p>
              ) : (
                <div className="lc-conexoes-grid">
                  {conexoes.map((conexao) => (
                    <div
                      key={conexao.id}
                      className="lc-conexao-item"
                      onClick={() => {
                        const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "{}");
                        const ehProprioUsuario = conexao.id === usuarioLogado.id;
                        ehProprioUsuario
                          ? navigate("/Perfil")
                          : navigate(`/usuarios/${conexao.id}`);
                      }}
                    >
                      <div className="lc-conexao-avatar">
                        {conexao.nome?.charAt(0).toUpperCase()}
                      </div>
                      <div className="lc-conexao-nome">
                        {conexao.nome} {conexao.sobrenome}
                      </div>
                      <div className="lc-conexao-idioma">{conexao.idioma_nativo}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aba PROGRESSO */}
        {abaAtiva === "progresso" && (
          <div className="lc-aba-content">
            <div className="lc-progresso-card">
              <h3>Progresso de aprendizado</h3>
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "32px 0" }}>
                Em breve.
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default Perfil;