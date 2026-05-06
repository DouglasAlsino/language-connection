import React, { useState } from "react";
import axios from "axios";
import "./LearningPage.css";
import { temasPorIdiomaENivel } from "../../data/temasAprendizado";

function LearningPage() {
  const [topico, setTopico] = useState("");
  const [idioma, setIdioma] = useState("Português");
  const [idiomaNativo, setIdiomaNativo] = useState("Português");
  const [nivel, setNivel] = useState("Básico");
  const [explicacaoIA, setExplicacaoIA] = useState(null);
  const [sessaoId, setSessaoId] = useState(null);
  const [quizIA, setQuizIA] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [quizCorrigido, setQuizCorrigido] = useState(false);
  const [modoEscolhaTema, setModoEscolhaTema] = useState(null);
  const [temaSorteado, setTemaSorteado] = useState(null);

  const token = localStorage.getItem("token");

  // ── todas as funções permanecem exatamente iguais ──────────────────────────

  const handleGerarExplicacao = async (e) => {
    e.preventDefault();
    setErro("");
    setExplicacaoIA(null);
    setQuizIA(null);
    setQuizCorrigido(false);
    if (!topico.trim()) { setErro("Por favor, insira um tópico para aprender."); return; }
    setCarregando(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/ia/ensinar",
        { topico, idioma, idiomaNativo, nivel },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExplicacaoIA(response.data);
      try {
        const resSessao = await axios.post(
          "http://localhost:3000/atividades/sessao",
          { idioma, idioma_nativo: idiomaNativo, nivel, tema: topico, explicacao: response.data },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSessaoId(resSessao.data.sessao_id);
      } catch (err) { console.warn("Não foi possível salvar a sessão:", err); }
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Não foi possível gerar a explicação.");
    } finally { setCarregando(false); }
  };

  const handleGerarQuiz = async () => {
    setErro(""); setQuizIA(null); setQuizCorrigido(false); setCarregando(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/ia/gerar-quiz",
        { topico, idioma, nivel, explicacao: explicacaoIA ? JSON.stringify(explicacaoIA) : undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuizIA(response.data);
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Não foi possível gerar o quiz.");
    } finally { setCarregando(false); }
  };

  const handleRespostaQuiz = (perguntaId, resposta) => {
    setQuizIA((prev) => ({
      ...prev,
      perguntas: prev.perguntas.map((p) =>
        p.id === perguntaId ? { ...p, resposta_usuario: resposta } : p
      ),
    }));
  };

  const handleCorrigirQuiz = async () => {
    const novasPerguntas = quizIA.perguntas.map((p) => ({
      ...p, correta: p.resposta_usuario === p.resposta_correta,
    }));
    setQuizIA((prev) => ({ ...prev, perguntas: novasPerguntas }));
    setQuizCorrigido(true);
    const corretas = novasPerguntas.filter((p) => p.correta).length;
    try {
      await axios.post(
        "http://localhost:3000/atividades/quiz",
        {
          sessao_id: sessaoId, idioma, tema: topico,
          pontuacao: Math.round((corretas / novasPerguntas.length) * 100),
          total_questoes: novasPerguntas.length, perguntas: novasPerguntas,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) { console.warn("Não foi possível salvar o quiz:", err); }
  };

  const calcularPontuacao = () => {
    if (!quizIA || !quizCorrigido) return 0;
    return (quizIA.perguntas.filter((p) => p.correta).length / quizIA.perguntas.length) * 100;
  };

  const handleCompartilhar = async () => {
    try {
      setCarregando(true);
      await axios.post(
        "http://localhost:3000/posts/compartilhar-aprendizado",
        { topico, idioma, nivel, pontuacao: calcularPontuacao().toFixed(0), explicacao: explicacaoIA, quiz: quizIA },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Seu aprendizado foi compartilhado na comunidade!");
    } catch (err) { setErro("Não foi possível compartilhar. Tente novamente."); }
    finally { setCarregando(false); }
  };

  const sortearTema = () => {
    const temas = temasPorIdiomaENivel[idioma]?.[nivel];
    if (!temas || temas.length === 0) return;
    const tema = temas[Math.floor(Math.random() * temas.length)];
    setTemaSorteado(tema);
    setTopico(tema);
  };

  // Dados dos níveis com descrição para os cards
  const niveis = [
    { valor: "Básico", descricao: "Primeiros passos" },
    { valor: "Intermediário", descricao: "Conversação fluida" },
    { valor: "Avançado", descricao: "Domínio refinado" },
  ];

  // ── JSX novo ───────────────────────────────────────────────────────────────

  return (
    <div className="lp-page">

      {/* Hero com gradiente */}
      <div className="lp-hero">
        <h1 className="lp-hero-title">
          Aprendizado com <span className="lp-hero-destaque">IA</span>
        </h1>
        <p className="lp-hero-sub">
          Explore tópicos gramaticais e de vocabulário com explicações personalizadas para o seu nível.
        </p>
      </div>

      {/* Card principal do formulário */}
      <div className="lp-card">

        {/* Cabeçalho do card */}
        <div className="lp-card-header">
          <div className="lp-card-icon">✏️</div>
          <div>
            <div className="lp-card-titulo">Gerar Nova Explicação</div>
            <div className="lp-card-sub">Configure as opções abaixo para personalizar.</div>
          </div>
        </div>

        <form onSubmit={handleGerarExplicacao}>
          {erro && <p className="lp-erro">{erro}</p>}

          {/* Idioma e Idioma Nativo lado a lado */}
          <div className="lp-selects-grid">
            <div className="lp-field">
              <label className="lp-label">
                <span className="lp-label-icon">✦</span> Idioma que quer aprender
              </label>
              <select value={idioma} onChange={(e) => setIdioma(e.target.value)} className="lp-select">
                <option>Português</option>
                <option>Inglês</option>
                <option>Espanhol</option>
                <option>Francês</option>
                <option>Alemão</option>
                <option>Japonês</option>
              </select>
            </div>
            <div className="lp-field">
              <label className="lp-label">
                <span className="lp-label-icon">✦</span> Idioma que quer ler a lição
              </label>
              <select value={idiomaNativo} onChange={(e) => setIdiomaNativo(e.target.value)} className="lp-select">
                <option>Português</option>
                <option>Inglês</option>
                <option>Espanhol</option>
                <option>Francês</option>
                <option>Alemão</option>
                <option>Japonês</option>
              </select>
            </div>
          </div>

          {/* Nível como cards clicáveis */}
          <div className="lp-field">
            <label className="lp-label">
              <span className="lp-label-icon">🎓</span> Nível
            </label>
            <div className="lp-niveis-grid">
              {niveis.map((n) => (
                <div
                  key={n.valor}
                  className={`lp-nivel-card ${nivel === n.valor ? "ativo" : ""}`}
                  onClick={() => setNivel(n.valor)}
                >
                  <div className="lp-nivel-nome">{n.valor}</div>
                  <div className="lp-nivel-desc">{n.descricao}</div>
                  <div className={`lp-nivel-dot ${nivel === n.valor ? "ativo" : ""}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Escolha do modo de tema */}
          <div className="lp-field">
            <label className="lp-label">
              <span className="lp-label-icon">💡</span> Como você quer escolher o tema?
            </label>

            {/* Botões pill de modo */}
            <div className="lp-modo-pills">
              <button
                type="button"
                className={`lp-pill ${modoEscolhaTema === "sugerir" ? "ativo" : ""}`}
                onClick={() => { setModoEscolhaTema("sugerir"); setTemaSorteado(null); setTopico(""); }}
              >
                Quero sugerir um tema
              </button>
              <button
                type="button"
                className={`lp-pill ${modoEscolhaTema === "sortear" ? "ativo" : ""}`}
                onClick={() => { setModoEscolhaTema("sortear"); setTemaSorteado(null); setTopico(""); }}
              >
                Me sugira um tema
              </button>
            </div>

            {/* Campo de input quando usuário quer sugerir */}
            {modoEscolhaTema === "sugerir" && (
              <input
                type="text"
                placeholder="Ex.: tempos verbais no passado, pronomes pessoais..."
                value={topico}
                onChange={(e) => setTopico(e.target.value)}
                className="lp-input"
              />
            )}

            {/* Área de sorteio */}
            {modoEscolhaTema === "sortear" && (
              <div className="lp-sortear-area">
                {temaSorteado ? (
                  <div className="lp-tema-sorteado">
                    <p>Tema sorteado:</p>
                    <strong>{temaSorteado}</strong>
                    <button type="button" className="lp-pill ativo" onClick={sortearTema}>
                      Sortear outro
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="lp-pill ativo"
                    onClick={sortearTema}
                    disabled={!idioma || !nivel}
                  >
                    Sortear tema
                  </button>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="lp-btn-submit" disabled={carregando}>
            {carregando ? "Gerando..." : "Gerar Explicação"}
          </button>
        </form>
      </div>

      {/* Card de explicação */}
      {explicacaoIA && (
        <div className="lp-card lp-resultado-card">
          <h3 className="lp-resultado-titulo">{explicacaoIA.titulo}</h3>
          <p><strong>Introdução:</strong> {explicacaoIA.introducao}</p>
          <p><strong>Regras:</strong> {explicacaoIA.regras}</p>
          <h4 className="lp-secao-titulo">Exemplos</h4>
          <ul className="lp-lista">
            {explicacaoIA.exemplos?.map((ex, i) => <li key={i}>{ex}</li>)}
          </ul>
          <h4 className="lp-secao-titulo">Exercício de Fixação</h4>
          <ol className="lp-lista">
            {explicacaoIA.exercicio?.map((ex, i) => <li key={i}>{ex}</li>)}
          </ol>
          <p><strong>Resumo:</strong> {explicacaoIA.resumo}</p>
          <button onClick={handleGerarQuiz} className="lp-btn-submit lp-btn-verde" disabled={carregando}>
            {carregando ? "Gerando Quiz..." : "Gerar Quiz"}
          </button>
        </div>
      )}

      {/* Card do quiz */}
      {quizIA && (
        <div className="lp-card">
          <h3 className="lp-resultado-titulo">{quizIA.titulo_quiz}</h3>
          {quizIA.perguntas.map((pergunta) => (
            <div key={pergunta.id} className="lp-quiz-pergunta">
              <p className="lp-quiz-enunciado">{pergunta.id}. {pergunta.pergunta}</p>
              <div className="lp-opcoes">
                {Object.entries(pergunta.opcoes).map(([key, value]) => (
                  <label
                    key={key}
                    className={`lp-opcao ${quizCorrigido && pergunta.resposta_correta === key ? "correta" : ""} ${quizCorrigido && pergunta.resposta_usuario === key && pergunta.resposta_usuario !== pergunta.resposta_correta ? "errada" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`pergunta-${pergunta.id}`}
                      value={key}
                      checked={pergunta.resposta_usuario === key}
                      onChange={() => handleRespostaQuiz(pergunta.id, key)}
                      disabled={quizCorrigido}
                    />
                    {key}) {value}
                  </label>
                ))}
              </div>
              {quizCorrigido && (
                <p className={`lp-feedback ${pergunta.correta ? "certo" : "errado"}`}>
                  {pergunta.correta ? "Correto!" : `Incorreto. Resposta: ${pergunta.resposta_correta}) ${pergunta.opcoes[pergunta.resposta_correta]}`}
                </p>
              )}
            </div>
          ))}

          {!quizCorrigido && (
            <button
              onClick={handleCorrigirQuiz}
              className="lp-btn-submit"
              disabled={carregando || quizIA.perguntas.some((p) => !p.resposta_usuario)}
            >
              Corrigir Quiz
            </button>
          )}

          {quizCorrigido && (
            <div className="lp-pontuacao">
              <h4>Sua Pontuação: {calcularPontuacao().toFixed(0)}%</h4>
              <button onClick={handleCompartilhar} className="lp-btn-submit" disabled={carregando}>
                {carregando ? "Compartilhando..." : "Compartilhar na Comunidade"}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default LearningPage;