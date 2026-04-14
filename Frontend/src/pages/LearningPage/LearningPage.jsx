import React, { useState } from "react";
import axios from "axios";
import "./LearningPage.css";

function LearningPage() {
  const [topico, setTopico] = useState("");
  const [idioma, setIdioma] = useState("Português");
  const [idiomaNativo, setIdiomaNativo] = useState("Português"); // Idioma padrão
  const [nivel, setNivel] = useState("Básico");
  const [explicacaoIA, setExplicacaoIA] = useState(null);
  const [quizIA, setQuizIA] = useState(null); // Novo estado para o quiz
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [quizCorrigido, setQuizCorrigido] = useState(false); // Para saber se o quiz já foi corrigido

  const token = localStorage.getItem("token");

  const handleGerarExplicacao = async (e) => {
    e.preventDefault();
    setErro("");
    setExplicacaoIA(null);
    setQuizIA(null); // Limpa o quiz ao gerar nova explicação
    setQuizCorrigido(false);

    if (!topico.trim()) {
      setErro("Por favor, insira um tópico para aprender.");
      return;
    }

    setCarregando(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/ia/ensinar",
        { topico, idioma, idiomaNativo, nivel },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExplicacaoIA(response.data);
    } catch (err) {
      console.error("Erro ao gerar explicação:", err);
      setErro("Não foi possível gerar a explicação. Tente novamente mais tarde.");
      if (err.response && err.response.data && err.response.data.mensagem) {
        setErro(err.response.data.mensagem);
      }
    } finally {
      setCarregando(false);
    }
  };

  // Nova função para gerar o quiz
  const handleGerarQuiz = async () => {
    setErro("");
    setQuizIA(null); // Limpa o quiz anterior
    setQuizCorrigido(false);

    setCarregando(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/ia/gerar-quiz", // Nosso novo endpoint de quiz
        {
          topico,
          idioma,
          nivel,
          explicacao: explicacaoIA ? JSON.stringify(explicacaoIA) : undefined, // Envia a explicação como string
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setQuizIA(response.data);
    } catch (err) {
      console.error("Erro ao gerar quiz:", err);
      setErro("Não foi possível gerar o quiz. Tente novamente mais tarde.");
      if (err.response && err.response.data && err.response.data.mensagem) {
        setErro(err.response.data.mensagem);
      }
    } finally {
      setCarregando(false);
    }
  };

  // Função para lidar com a resposta do usuário no quiz
  const handleRespostaQuiz = (perguntaId, resposta) => {
    setQuizIA((prevQuiz) => {
      const novasPerguntas = prevQuiz.perguntas.map((p) =>
        p.id === perguntaId ? { ...p, resposta_usuario: resposta } : p
      );
      return { ...prevQuiz, perguntas: novasPerguntas };
    });
  };

  // Função para corrigir o quiz
  const handleCorrigirQuiz = () => {
    setQuizIA((prevQuiz) => {
      const novasPerguntas = prevQuiz.perguntas.map((p) => ({
        ...p,
        correta: p.resposta_usuario === p.resposta_correta,
      }));
      return { ...prevQuiz, perguntas: novasPerguntas };
    });
    setQuizCorrigido(true);
  };

  // Calcula a pontuação
  const calcularPontuacao = () => {
    if (!quizIA || !quizCorrigido) return 0;
    const corretas = quizIA.perguntas.filter(p => p.correta).length;
    return (corretas / quizIA.perguntas.length) * 100;
  };

  // Função para compartilhar na comunidade
  const handleCompartilhar = async () => {
    try {
      setCarregando(true);
      const pontuacao = calcularPontuacao();

      await axios.post(
        "http://localhost:3000/posts/compartilhar-aprendizado",
        {
          topico,
          idioma,
          nivel,
          pontuacao: pontuacao.toFixed(0),
          explicacao: explicacaoIA,
          quiz: quizIA,
        },
        {
           headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Seu aprendizado foi compartilhado na comunidade!");
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
      setErro("Não foi possível compartilhar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="learning-page-container">
      <h1 className="learning-title">Aprendizado com IA</h1>
      <p className="learning-subtitle">
        Explore tópicos gramaticais e de vocabulário com explicações personalizadas.
      </p>

      <div className="learning-form-card">
        <h2>Gerar Nova Explicação</h2>
        <form onSubmit={handleGerarExplicacao}>
          {erro && <p className="error-message">{erro}</p>}

          <div className="form-group">
            <label htmlFor="topico">Tópico:</label>
            <input
              id="topico"
              type="text"
              placeholder="Ex: Present Simple, Subjunctive Mood, Vocabulário de Viagem"
              value={topico}
              onChange={(e) => setTopico(e.target.value)}
              className="learning-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="idioma">Idioma:</label>
            <select
              id="idioma"
              value={idioma}
              onChange={(e) => setIdioma(e.target.value)}
              className="learning-select"
            >
              <option value="Português">Português</option>
              <option value="Inglês">Inglês</option>
              <option value="Espanhol">Espanhol</option>
              <option value="Francês">Francês</option>
              <option value="Alemão">Alemão</option>
              <option value="Japonês">Japonês</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="idiomaNativo">Idioma Nativo:</label>
            <select
              id="idioma"
              value={idiomaNativo}
              onChange={(e) => setIdiomaNativo(e.target.value)}
              className="learning-select"
            >
              <option value="Português">Português</option>
              <option value="Inglês">Inglês</option>
              <option value="Espanhol">Espanhol</option>
              <option value="Francês">Francês</option>
              <option value="Alemão">Alemão</option>
              <option value="Japonês">Japonês</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nivel">Nível:</label>
            <select
              id="nivel"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="learning-select"
            >
              <option value="Básico">Básico</option>
              <option value="Intermediário">Intermediário</option>
              <option value="Avançado">Avançado</option>
            </select>
          </div>

          <button type="submit" className="learning-submit-btn" disabled={carregando}>
            {carregando ? "Gerando..." : "Gerar Explicação"}
          </button>
        </form>
      </div>

      {/* Área para exibir a explicação da IA */}
      {explicacaoIA && (
        <div className="ia-explanation-card">
          <h3>{explicacaoIA.titulo}</h3>
          <p><strong>Introdução:</strong> {explicacaoIA.introducao}</p>
          <p><strong>Regras:</strong> {explicacaoIA.regras}</p>
          <h4>Exemplos:</h4>
          <ul>
            {explicacaoIA.exemplos && explicacaoIA.exemplos.map((ex, index) => (
              <li key={index}>{ex}</li>
            ))}
          </ul>
          <h4>Exercício de Fixação:</h4>
          <ol>
            {explicacaoIA.exercicio && explicacaoIA.exercicio.map((ex, index) => (
              <li key={index}>{ex}</li>
            ))}
          </ol>
          <p><strong>Resumo:</strong> {explicacaoIA.resumo}</p>

          <button
            onClick={handleGerarQuiz}
            className="learning-submit-btn generate-quiz-btn"
            disabled={carregando}
          >
            {carregando ? "Gerando Quiz..." : "Gerar Quiz"}
          </button>
        </div>
      )}

      {/* Área para exibir o quiz da IA */}
      {quizIA && (
        <div className="ia-quiz-card">
          <h3>{quizIA.titulo_quiz}</h3>
          {quizIA.perguntas.map((pergunta) => (
            <div key={pergunta.id} className="quiz-question">
              <p className="question-text">{pergunta.id}. {pergunta.pergunta}</p>
              <div className="options-container">
                {Object.entries(pergunta.opcoes).map(([key, value]) => (
                  <label
                    key={key}
                    className={`option-label ${
                      quizCorrigido && pergunta.resposta_correta === key ? 'correct-option' : ''
                    } ${
                      quizCorrigido && pergunta.resposta_usuario === key && pergunta.resposta_usuario !== pergunta.resposta_correta ? 'incorrect-option' : ''
                    }`}
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
                <p className={`feedback-text ${pergunta.correta ? 'correct-feedback' : 'incorrect-feedback'}`}>
                  {pergunta.correta ? "Correto!" : `Incorreto. A resposta correta era: ${pergunta.resposta_correta}) ${pergunta.opcoes[pergunta.resposta_correta]}`}
                </p>
              )}
            </div>
          ))}
          {!quizCorrigido && (
            <button
              onClick={handleCorrigirQuiz}
              className="learning-submit-btn correct-quiz-btn"
              disabled={carregando || quizIA.perguntas.some(p => !p.resposta_usuario)} // Desabilita se nem todas as perguntas foram respondidas
            >
              Corrigir Quiz
            </button>
          )}
          {quizCorrigido && (
            <div className="quiz-score">
              <h4>Sua Pontuação: {calcularPontuacao().toFixed(0)}%</h4>
              <button
                onClick={handleCompartilhar}
                className="learning-submit-btn share-btn"
                disabled={carregando}
              >
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