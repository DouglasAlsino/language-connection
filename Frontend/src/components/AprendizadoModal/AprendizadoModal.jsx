import React, { useState } from "react";
import "./AprendizadoModal.css";
import "../../styles/quiz-shared.css";

function AprendizadoModal({ post, onFechar }) {
  const dados = post.dados_aprendizado;
  const explicacao = dados?.explicacao;
  const quizOriginal = dados?.quiz;

  const [quiz, setQuiz] = useState(
    quizOriginal
      ? {
          ...quizOriginal,
          perguntas: quizOriginal.perguntas.map((p) => ({
            ...p,
            resposta_usuario: null,
            correta: null,
          })),
        }
      : null
  );
  const [quizCorrigido, setQuizCorrigido] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("explicacao"); // 'explicacao' ou 'quiz'

  const handleRespostaQuiz = (perguntaId, resposta) => {
    setQuiz((prevQuiz) => {
      const novasPerguntas = prevQuiz.perguntas.map((p) =>
        p.id === perguntaId ? { ...p, resposta_usuario: resposta } : p
      );
      return { ...prevQuiz, perguntas: novasPerguntas };
    });
  };

  const handleCorrigirQuiz = () => {
    setQuiz((prevQuiz) => {
      const novasPerguntas = prevQuiz.perguntas.map((p) => ({
        ...p,
        correta: p.resposta_usuario === p.resposta_correta,
      }));
      return { ...prevQuiz, perguntas: novasPerguntas };
    });
    setQuizCorrigido(true);
  };

  const calcularPontuacao = () => {
    if (!quiz || !quizCorrigido) return 0;
    const corretas = quiz.perguntas.filter((p) => p.correta).length;
    return (corretas / quiz.perguntas.length) * 100;
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{post.titulo}</h2>
          <button className="modal-fechar" onClick={onFechar}>✕</button>
        </div>

        <div className="modal-abas">
          <button
            className={`modal-aba ${abaAtiva === "explicacao" ? "ativa" : ""}`}
            onClick={() => setAbaAtiva("explicacao")}
          >
            Explicação
          </button>
          <button
            className={`modal-aba ${abaAtiva === "quiz" ? "ativa" : ""}`}
            onClick={() => setAbaAtiva("quiz")}
          >
            Quiz
          </button>
        </div>

        <div className="modal-conteudo">
          {/* Aba de Explicação */}
          {abaAtiva === "explicacao" && explicacao && (
            <div className="modal-explicacao">
              <h3>{explicacao.titulo}</h3>
              <p><strong>Introdução:</strong> {explicacao.introducao}</p>
              <p><strong>Regras:</strong> {explicacao.regras}</p>
              <h4>Exemplos:</h4>
              <ul>
                {explicacao.exemplos && explicacao.exemplos.map((ex, index) => (
                  <li key={index}>{ex}</li>
                ))}
              </ul>
              <h4>Exercício de Fixação:</h4>
              <ol>
                {explicacao.exercicio && explicacao.exercicio.map((ex, index) => (
                  <li key={index}>{ex}</li>
                ))}
              </ol>
              <p><strong>Resumo:</strong> {explicacao.resumo}</p>
              <button
                className="modal-btn-quiz"
                onClick={() => setAbaAtiva("quiz")}
              >
                Tentar o Quiz
              </button>
            </div>
          )}

          {/* Aba de Quiz */}
          {abaAtiva === "quiz" && quiz && (
            <div className="modal-quiz">
              <h3>{quiz.titulo_quiz}</h3>
              {quiz.perguntas.map((pergunta) => (
                <div key={pergunta.id} className="quiz-question">
                  <p className="question-text">
                    {pergunta.id}. {pergunta.pergunta}
                  </p>
                  <div className="options-container">
                    {Object.entries(pergunta.opcoes).map(([key, value]) => (
                      <label
                        key={key}
                        className={`option-label ${
                          quizCorrigido && pergunta.resposta_correta === key
                            ? "correct-option"
                            : ""
                        } ${
                          quizCorrigido &&
                          pergunta.resposta_usuario === key &&
                          pergunta.resposta_usuario !== pergunta.resposta_correta
                            ? "incorrect-option"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={`modal-pergunta-${pergunta.id}`}
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
                    <p
                      className={`feedback-text ${
                        pergunta.correta ? "correct-feedback" : "incorrect-feedback"
                      }`}
                    >
                      {pergunta.correta
                        ? "Correto!"
                        : `Incorreto. A resposta correta era: ${pergunta.resposta_correta}) ${pergunta.opcoes[pergunta.resposta_correta]}`}
                    </p>
                  )}
                </div>
              ))}
              {!quizCorrigido && (
                <button
                  className="modal-btn-corrigir"
                  onClick={handleCorrigirQuiz}
                  disabled={quiz.perguntas.some((p) => !p.resposta_usuario)}
                >
                  Corrigir Quiz
                </button>
              )}
              {quizCorrigido && (
                <div className="modal-pontuacao">
                  <h4>Sua Pontuação: {calcularPontuacao().toFixed(0)}%</h4>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AprendizadoModal;