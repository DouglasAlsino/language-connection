import "./Profile.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import EditarPerfilModal from "../../components/EditarPerfilModal/EditarPerfilModal.jsx";
import AtividadeModal from "../../components/AtividadeModal/AtividadeModal.jsx";
import Progresso from "../../components/Progresso/Progresso";

// ─── ConexaoItem ────────────────────────────────────────────────────────────
// Recebe isProprioPeril para saber qual botão mostrar na base do card:
// - Dono do perfil: botão "Desconectar"
// - Visitante: botão "Ver perfil"
function ConexaoItem({ conexao, token, isProprioPeril, onRemover }) {
  const navigate = useNavigate();
  const [removendo, setRemovendo] = useState(false);

  const desconectar = async () => {
    try {
      setRemovendo(true);
      await axios.delete(`http://localhost:3000/conexoes/${conexao.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onRemover(conexao.id);
    } catch (error) {
      console.error("Erro ao desconectar:", error);
    } finally {
      setRemovendo(false);
    }
  };

  const irParaPerfil = () => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "{}");
    if (conexao.id === usuarioLogado.id) {
      navigate("/profile");
    } else {
      navigate(`/usuarios/${conexao.id}`);
    }
  };

  const coresAvatar = [
    "#4f46e5", "#7c3aed", "#db2777", "#ea580c",
    "#16a34a", "#0284c7", "#9333ea", "#b45309"
  ];

  function getCorAvatar(nome) {
    if (!nome) return coresAvatar[0];
    const indice = nome.charCodeAt(0) % coresAvatar.length;
    return coresAvatar[indice];
  }

  return (
    <div className="lc-conexao-item">
      <div
        className="lc-conexao-avatar"
        onClick={irParaPerfil}
        style={{ background: getCorAvatar(conexao.nome) }}
      >
        {conexao.nome?.charAt(0).toUpperCase()}
      </div>

      <div className="lc-conexao-info" onClick={irParaPerfil}>
        <div className="lc-conexao-nome">
          {conexao.nome} {conexao.sobrenome}
        </div>
        <div className="lc-conexao-idioma">{conexao.idioma_nativo}</div>
      </div>

      {/* Botão da base do card muda conforme quem está vendo */}
      {isProprioPeril ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
          <button
            className="lc-btn-desconectar"
            onClick={desconectar}
            disabled={removendo}
          >
            {removendo ? "Removendo..." : "Desconectar"}
          </button>

          <button className="lc-btn-ver-perfil" onClick={irParaPerfil}>
            Ver perfil
          </button>
        </div>
      ) : (
        <button className="lc-btn-ver-perfil" onClick={irParaPerfil}>
          Ver perfil
        </button>
      )}
    </div>
  );
}

// ─── Perfil ─────────────────────────────────────────────────────────────────
function Perfil() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [conexoes, setConexoes] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("atividade");
  const [carregando, setCarregando] = useState(true);
  const [atividades, setAtividades] = useState([]);
  const [progresso, setProgresso] = useState(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [atividadeModalAberta, setAtividadeModalAberta] = useState(null);

  // Novos estados para controlar a conexão com o perfil visitado
  const [statusConexao, setStatusConexao] = useState("nenhuma");
  const [desconectando, setDesconectando] = useState(false);

  const token = localStorage.getItem("token");
  const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const idAlvo = id || usuarioLogado.id;

  // true quando o usuário logado está vendo o próprio perfil
  const isProprioPeril = !id || parseInt(id) === usuarioLogado.id;

  useEffect(() => {
    const buscarPerfil = async () => {
      try {
        setCarregando(true);

        const resPerfil = await axios.get(
          `http://localhost:3000/usuarios/${idAlvo}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const resAtividades = await axios.get(
          `http://localhost:3000/atividades/lista/${idAlvo}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAtividades(resAtividades.data);

        const resProgresso = await axios.get(
          `http://localhost:3000/atividades/progresso/${idAlvo}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProgresso(resProgresso.data);

        const resConexoes = await axios.get(
          `http://localhost:3000/conexoes/aceitas/${idAlvo}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Só busca status de conexão quando está vendo o perfil de outra pessoa
        // Não faz sentido verificar se você está conectado consigo mesmo
        if (!isProprioPeril) {
          const resStatus = await axios.get(
            `http://localhost:3000/conexoes/status/${idAlvo}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setStatusConexao(resStatus.data.status);
        }

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

  // Envia solicitação de conexão para o usuário do perfil visitado
  async function enviarSolicitacao() {
    try {
      await axios.post(
        "http://localhost:3000/conexoes",
        { receptor_id: idAlvo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatusConexao("pendente");
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
    }
  }

  // Desfaz a conexão com o usuário do perfil visitado
  async function desconectar() {
    try {
      setDesconectando(true);
      await axios.delete(`http://localhost:3000/conexoes/${idAlvo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatusConexao("nenhuma");
    } catch (error) {
      console.error("Erro ao desconectar:", error);
    } finally {
      setDesconectando(false);
    }
  }

  // Decide qual botão mostrar na sidebar dependendo de quem está vendo o perfil
  // e qual o status atual da conexão entre os dois usuários
  function renderizarBotaoConexao() {
    if (isProprioPeril) {
      return (
        <button
          className="lc-btn-edit"
          onClick={() => setModalEditarAberto(true)}
        >
          Editar perfil
        </button>
      );
    }

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
        <button className="lc-btn-connect pendente" disabled>
          Solicitação pendente
        </button>
      );
    }

    // statusConexao === "nenhuma"
    return (
      <button className="lc-btn-connect" onClick={enviarSolicitacao}>
        Conectar
      </button>
    );
  }

  if (carregando) return <div className="lc-perfil-loading">Carregando perfil...</div>;
  if (!perfil) return <div className="lc-perfil-loading">Usuário não encontrado.</div>;

  const inicial = perfil.nome?.charAt(0).toUpperCase() || "U";
  const nomeCompleto = `${perfil.nome} ${perfil.sobrenome}`;

  return (
    <div className="lc-perfil-page">

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

            {/* Substituímos o condicional simples pela função que cobre todos os casos */}
            {renderizarBotaoConexao()}

          </div>
        </div>

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
              <span className={`lc-nivel-badge lc-nivel-b1`}>
                {perfil.nivel || "A1"}
              </span>
            </div>
          )}
        </div>

        {perfil.bio && (
          <div className="lc-info-card">
            <div className="lc-info-card-title">Sobre</div>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>{perfil.bio}</p>
          </div>
        )}
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
            {atividades.length === 0 ? (
              <div className="lc-atividade-card">
                <p style={{ color: "#94a3b8", textAlign: "center", padding: "32px 0" }}>
                  Nenhuma atividade ainda.
                </p>
              </div>
            ) : (
              atividades
                .filter((atividade) => atividade.tipo !== "quiz")
                .map((atividade) => (
                  <div key={`${atividade.tipo}-${atividade.id}`} className="lc-atividade-item">
                    <div className="lc-atividade-icone">
                      {atividade.tipo === "aprendizado" && "📚"}
                      {atividade.tipo === "post" && "💬"}
                    </div>
                    <div className="lc-atividade-info">
                      <div className="lc-atividade-titulo">
                        {atividade.tipo === "aprendizado" && `Estudou: ${atividade.tema}`}
                        {atividade.tipo === "post" && `Publicou: ${atividade.tema}`}
                      </div>
                      <div className="lc-atividade-meta">
                        {atividade.idioma} {atividade.nivel ? `· ${atividade.nivel}` : ""} ·{" "}
                        {new Date(atividade.criado_em).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    {atividade.tipo === "aprendizado" && (
                      <button
                        className="lc-atividade-btn-ver"
                        onClick={() => setAtividadeModalAberta(atividade)}
                      >
                        Ver
                      </button>
                    )}
                  </div>
                ))
            )}
          </div>
        )}

        {atividadeModalAberta && (
          <AtividadeModal
            atividade={atividadeModalAberta}
            onFechar={() => setAtividadeModalAberta(null)}
          />
        )}

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
                    <ConexaoItem
                      key={conexao.id}
                      conexao={conexao}
                      token={token}
                      isProprioPeril={isProprioPeril}
                      onRemover={(id) =>
                        setConexoes((prev) => prev.filter((c) => c.id !== id))
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {abaAtiva === "progresso" && (
          <div className="lc-aba-content">
            <Progresso progresso={progresso} />
          </div>
        )}

      </main>

      {modalEditarAberto && (
        <EditarPerfilModal
          perfil={perfil}
          token={token}
          onFechar={() => setModalEditarAberto(false)}
          onSalvar={(dadosAtualizados) => setPerfil((prev) => ({ ...prev, ...dadosAtualizados }))}
        />
      )}

    </div>
  );
}

export default Perfil;