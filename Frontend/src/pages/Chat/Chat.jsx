import "./Chat.css";
import { useState } from "react";

// Lista simulada de conversas existentes
// Futuramente virá de GET /conversas/:userId
const CONVERSAS_MOCK = [
  {
    id: 1,
    nome: "Ana Silva",
    inicial: "A",
    cor: "linear-gradient(135deg,#10B981,#3B82F6)",
    ultimaMensagem: "Podemos praticar amanhã às 20h?",
    hora: "14:32",
    naoLidas: 2,
    online: true,
    idiomaNativo: "Português",
    idiomaAprendendo: "Inglês",
  },
  {
    id: 2,
    nome: "James Williams",
    inicial: "J",
    cor: "linear-gradient(135deg,#F97316,#FACC15)",
    ultimaMensagem: "Thanks for helping!",
    hora: "Ontem",
    naoLidas: 0,
    online: true,
    idiomaNativo: "Inglês",
    idiomaAprendendo: "Português",
  },
  {
    id: 3,
    nome: "Maria Hernández",
    inicial: "M",
    cor: "linear-gradient(135deg,#8B5CF6,#EC4899)",
    ultimaMensagem: "Te paso la lista de series :)",
    hora: "Seg",
    naoLidas: 0,
    online: false,
    idiomaNativo: "Espanhol",
    idiomaAprendendo: "Português",
  },
];

// Mensagens simuladas da conversa com Ana — futuramente: GET /mensagens/:conversaId
const MENSAGENS_MOCK = [
  { id: 1, texto: "Oi, Douglas! Podemos focar em phrasal verbs hoje?", minha: false, hora: "14:29" },
  { id: 2, texto: "Oi, Ana! Claro. Que tal começarmos com 'get up', 'wake up' e 'figure out'?", minha: true, hora: "14:30" },
  { id: 3, texto: "Perfeito! Você pode me mandar alguns exemplos de frases?", minha: false, hora: "14:31" },
  { id: 4, texto: "'I usually get up at 7 a.m.' e 'We need to figure out this problem'.", minha: true, hora: "14:32" },
];

function Chat() {
  // Conversa atualmente selecionada (clicada na lista esquerda)
  const [conversaAtiva, setConversaAtiva] = useState(CONVERSAS_MOCK[0]);

  // Lista de mensagens da conversa ativa
  const [mensagens, setMensagens] = useState(MENSAGENS_MOCK);

  // Texto sendo digitado no input de mensagem
  const [novaMensagem, setNovaMensagem] = useState("");

  // Envia uma nova mensagem
  const enviarMensagem = (e) => {
    e.preventDefault();

    // Não envia se estiver vazio ou só com espaços
    if (!novaMensagem.trim()) return;

    // Cria o objeto da nova mensagem
    // Futuramente: await api.post("/mensagens", { conversaId, texto })
    const mensagem = {
      id: mensagens.length + 1,
      texto: novaMensagem,
      minha: true, // mensagem enviada pelo usuário logado
      hora: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Adiciona a mensagem à lista existente
    setMensagens((prev) => [...prev, mensagem]);

    // Limpa o campo de input
    setNovaMensagem("");
  };

  return (
    <div className="lc-chat-page">

      {/* COLUNA ESQUERDA — lista de conversas */}
      <aside className="lc-chat-sidebar">
        <div className="lc-chat-sidebar-header">
          <h2>Mensagens</h2>
          <input
            className="lc-chat-search"
            placeholder="Buscar conversa"
          />
        </div>

        {/* Lista de conversas — cada item é clicável */}
        <div className="lc-conversations">
          {CONVERSAS_MOCK.map((conversa) => (
            <div
              key={conversa.id}
              // Marca a conversa ativa com classe diferente
              className={`lc-conversation-item ${
                conversaAtiva.id === conversa.id ? "active" : ""
              }`}
              onClick={() => setConversaAtiva(conversa)}
            >
              {/* Avatar da conversa */}
              <div
                className="lc-conv-avatar"
                style={{ background: conversa.cor }}
              >
                {conversa.inicial}
              </div>

              {/* Nome e última mensagem */}
              <div className="lc-conv-info">
                <div className="lc-conv-name">{conversa.nome}</div>
                <div className="lc-conv-last">{conversa.ultimaMensagem}</div>
              </div>

              {/* Hora e badge de não lidas */}
              <div className="lc-conv-meta">
                <span className="lc-conv-time">{conversa.hora}</span>
                {conversa.naoLidas > 0 && (
                  <span className="lc-conv-badge">{conversa.naoLidas}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* COLUNA CENTRAL — área de chat */}
      <main className="lc-chat-main">

        {/* Header do chat — mostra info do contato ativo */}
        <div className="lc-chat-header">
          <div className="lc-chat-header-left">
            <div
              className="lc-conv-avatar"
              style={{ background: conversaAtiva.cor }}
            >
              {conversaAtiva.inicial}
            </div>
            <div className="lc-chat-header-info">
              <span className="lc-chat-header-name">{conversaAtiva.nome}</span>
              <span className="lc-chat-header-lang">
                Nativo em{" "}
                <strong>{conversaAtiva.idiomaNativo}</strong> · Praticando{" "}
                <strong>{conversaAtiva.idiomaAprendendo}</strong>
              </span>
            </div>
          </div>
          <span className="lc-chat-header-status">
            {conversaAtiva.online ? "Online agora" : "Offline"}
          </span>
        </div>

        {/* Área de mensagens — onde os balões aparecem */}
        <div className="lc-chat-messages">
          <div className="lc-date-divider">Hoje</div>

          {/* Renderiza cada mensagem — alinha à esquerda ou direita */}
          {mensagens.map((msg) => (
            <div
              key={msg.id}
              className={`lc-message-row ${msg.minha ? "me" : ""}`}
            >
              <div className={`lc-message-bubble ${msg.minha ? "me" : "other"}`}>
                {msg.texto}
                {/* Horário dentro do balão */}
                <div className={`lc-message-time ${msg.minha ? "me" : ""}`}>
                  {msg.hora}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Área de input — para digitar e enviar mensagem */}
        <form className="lc-chat-input-area" onSubmit={enviarMensagem}>
          <button type="button" className="lc-icon-btn" title="Anexar">
            📎
          </button>
          <input
            className="lc-chat-input"
            placeholder="Escreva sua mensagem..."
            value={novaMensagem}
            // Atualiza o estado a cada tecla digitada
            onChange={(e) => setNovaMensagem(e.target.value)}
          />
          <button type="submit" className="lc-send-btn">
            Enviar ➤
          </button>
        </form>
      </main>

      {/* COLUNA DIREITA — painel de informações do contato */}
      <aside className="lc-chat-panel">
        <div className="lc-panel-card">
          <div
            className="lc-panel-avatar"
            style={{ background: conversaAtiva.cor }}
          >
            {conversaAtiva.inicial}
          </div>
          <div className="lc-panel-name">{conversaAtiva.nome}</div>
          <div className="lc-panel-lang">
            <strong>Nativo:</strong> {conversaAtiva.idiomaNativo}
            <br />
            <strong>Praticando:</strong> {conversaAtiva.idiomaAprendendo}
          </div>
          <button className="lc-btn-outline">Ver perfil completo</button>
          {/* Toggle de favorito — futuramente salvo no backend */}
          <label className="lc-favorite-toggle">
            <input type="checkbox" />
            Marcar como favorito
          </label>
        </div>
      </aside>

    </div>
  );
}

export default Chat;