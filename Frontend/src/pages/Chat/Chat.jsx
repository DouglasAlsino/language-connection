import "./Chat.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

// Cria o socket FORA do componente
// Isso garante uma única instância durante toda a vida da aplicação
// O StrictMode não consegue duplicar porque não está dentro do ciclo de render
const socket = io("http://localhost:3000", {
  autoConnect: false, // não conecta automaticamente, vamos controlar isso manualmente
});

function Chat() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "{}");

  const fimMensagensRef = useRef(null);

  const [conexoes, setConexoes] = useState([]);
  const [conversaAtiva, setConversaAtiva] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);
  const [termoBuscaConversa, setTermoBuscaConversa] = useState("");

  // ─── Conecta o socket e registra os listeners ─────────────────────
  useEffect(() => {

    // Conecta manualmente — controlamos quando isso acontece
    socket.connect();

    const aoConectar = () => {
      socket.emit("entrar_sala", usuarioLogado.id);
    };

    const aoReceberMensagem = (mensagem) => {
      setConversaAtiva((conversaAtualizada) => {
        if (
          conversaAtualizada &&
          (mensagem.remetente_id === conversaAtualizada.id ||
            mensagem.destinatario_id === conversaAtualizada.id)
        ) {
          setMensagens((prev) => {
            // Proteção extra contra duplicatas:
            // verifica se a mensagem já existe na lista pelo ID
            // antes de adicionar
            const jaExiste = prev.some((m) => m.id === mensagem.id);
            if (jaExiste) return prev;
            return [...prev, mensagem];
          });
        }
        return conversaAtualizada;
      });
    };

    // Registra os listeners usando as funções nomeadas acima
    // Funções nomeadas permitem remover o listener específico no cleanup
    socket.on("connect", aoConectar);
    socket.on("nova_mensagem", aoReceberMensagem);

    // Cleanup: remove APENAS os listeners, não desconecta o socket
    // porque o socket está fora do componente e pode ser reutilizado
    return () => {
      socket.off("connect", aoConectar);
      socket.off("nova_mensagem", aoReceberMensagem);
      socket.disconnect();
    };
  }, []);

  // ─── Busca conexões aceitas ────────────────────────────────────────
  useEffect(() => {
    const buscarConexoes = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/conexoes/aceitas/${usuarioLogado.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConexoes(res.data);
        if (res.data.length > 0) {
          setConversaAtiva(res.data[0]);
        }
      } catch (error) {
        console.error("Erro ao buscar conexões:", error);
      }
    };

    buscarConexoes();
  }, []);

  // ─── Busca histórico quando a conversa muda ───────────────────────
  useEffect(() => {
    if (!conversaAtiva) return;

    const buscarMensagens = async () => {
      try {
        setCarregandoMensagens(true);
        const res = await axios.get(
          `http://localhost:3000/mensagens/${conversaAtiva.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMensagens(res.data);
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
      } finally {
        setCarregandoMensagens(false);
      }
    };

    buscarMensagens();
  }, [conversaAtiva?.id]);

  // ─── Scroll automático ────────────────────────────────────────────
  useEffect(() => {
    fimMensagensRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // ─── Envia mensagem ───────────────────────────────────────────────
  const enviarMensagem = (e) => {
    e.preventDefault();
    if (!novaMensagem.trim() || !conversaAtiva) return;

    socket.emit("enviar_mensagem", {
      remetente_id: usuarioLogado.id,
      destinatario_id: conversaAtiva.id,
      texto: novaMensagem.trim(),
    });

    setNovaMensagem("");
  };

  const formatarHora = (data) => {
    return new Date(data).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ─── Lógica de filtro para as conversas ──────────────────────────
const conexoesFiltradas = conexoes.filter((conexao) => {
  const termo = termoBuscaConversa.toLowerCase();
  // Filtra pelo nome, sobrenome ou idioma nativo/aprendendo do contato
  return (
    conexao.nome.toLowerCase().includes(termo) ||
    conexao.sobrenome.toLowerCase().includes(termo) ||
    conexao.idioma_nativo.toLowerCase().includes(termo) ||
    conexao.idiomas_aprender.toLowerCase().includes(termo)
  );
});

  return (
    <div className="lc-chat-page">

      <aside className="lc-chat-sidebar">
        <div className="lc-chat-sidebar-header">
          <h2>Mensagens</h2>
          <input 
          className="lc-chat-search"
          placeholder="Buscar conversa"
          value={termoBuscaConversa}
          onChange={(e) => setTermoBuscaConversa(e.target.value)}
           />
        </div>

        <div className="lc-conversations">
          {conexoes.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "32px 16px", fontSize: "14px" }}>
              Você ainda não tem conexões. Conecte-se com alguém para começar a conversar!
            </p>
          ) : (
            conexoesFiltradas.map((conexao) => (
              <div
                key={conexao.id}
                className={`lc-conversation-item ${conversaAtiva?.id === conexao.id ? "active" : ""}`}
                onClick={() => setConversaAtiva(conexao)}
              >
                <div
                  className="lc-conv-avatar"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #06b6d4)" }}
                >
                  {conexao.nome?.charAt(0).toUpperCase()}
                </div>
                <div className="lc-conv-info">
                  <div className="lc-conv-name">{conexao.nome} {conexao.sobrenome}</div>
                  <div className="lc-conv-last">{conexao.idioma_nativo} → {conexao.idiomas_aprender}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <main className="lc-chat-main">
        {!conversaAtiva ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
            Selecione uma conversa para começar
          </div>
        ) : (
          <>
            <div className="lc-chat-header">
              <div className="lc-chat-header-left">
                <div
                  className="lc-conv-avatar"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #06b6d4)" }}
                >
                  {conversaAtiva.nome?.charAt(0).toUpperCase()}
                </div>
                <div className="lc-chat-header-info">
                  <span
                    className="lc-chat-header-name"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/usuarios/${conversaAtiva.id}`)}
                  >
                    {conversaAtiva.nome} {conversaAtiva.sobrenome}
                  </span>
                  <span className="lc-chat-header-lang">
                    Nativo em <strong>{conversaAtiva.idioma_nativo}</strong> · Praticando <strong>{conversaAtiva.idiomas_aprender}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="lc-chat-messages">
              <div className="lc-date-divider">Hoje</div>

              {carregandoMensagens ? (
                <p style={{ textAlign: "center", color: "#94a3b8", padding: "32px" }}>
                  Carregando mensagens...
                </p>
              ) : mensagens.length === 0 ? (
                <p style={{ textAlign: "center", color: "#94a3b8", padding: "32px" }}>
                  Nenhuma mensagem ainda. Diga olá! 👋
                </p>
              ) : (
                mensagens.map((msg) => {
                  const isMinha = msg.remetente_id === usuarioLogado.id;
                  return (
                    <div key={msg.id} className={`lc-message-row ${isMinha ? "me" : ""}`}>
                      <div className={`lc-message-bubble ${isMinha ? "me" : "other"}`}>
                        {msg.texto}
                        <div className={`lc-message-time ${isMinha ? "me" : ""}`}>
                          {formatarHora(msg.criado_em)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={fimMensagensRef} />
            </div>

            <form className="lc-chat-input-area" onSubmit={enviarMensagem}>
              <input
                className="lc-chat-input"
                placeholder="Escreva sua mensagem..."
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
              />
              <button type="submit" className="lc-send-btn">
                Enviar ➤
              </button>
            </form>
          </>
        )}
      </main>

      <aside className="lc-chat-panel">
        {conversaAtiva && (
          <div className="lc-panel-card">
            <div
              className="lc-panel-avatar"
              style={{ background: "linear-gradient(135deg, #4f46e5, #06b6d4)" }}
            >
              {conversaAtiva.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="lc-panel-name">{conversaAtiva.nome} {conversaAtiva.sobrenome}</div>
            <div className="lc-panel-lang">
              <strong>Nativo:</strong> {conversaAtiva.idioma_nativo}
              <br />
              <strong>Praticando:</strong> {conversaAtiva.idiomas_aprender}
            </div>
            <button
              className="lc-btn-outline"
              onClick={() => navigate(`/usuarios/${conversaAtiva.id}`)}
            >
              Ver perfil completo
            </button>
          </div>
        )}
      </aside>

    </div>
  );
}

export default Chat;